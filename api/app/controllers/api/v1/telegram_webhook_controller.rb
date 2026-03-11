# frozen_string_literal: true

# Telegram Bot Webhook Controller
#
# This controller receives incoming messages from the Telegram Bot API
# and creates field updates with automatic project matching via geolocation.
#
# Setup:
# 1. Create a bot via @BotFather on Telegram → get BOT_TOKEN
# 2. Set webhook: curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourapi.com/api/v1/telegram/webhook"
# 3. Set ENV vars: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET
#
# How it works:
# - PM sends photo + message to bot from job site
# - Bot receives photo with EXIF GPS coordinates
# - System reverse geocodes GPS → street address
# - Fuzzy matches address to project in database
# - Creates FieldUpdate record linked to the correct project
# - Replies to PM confirming which project it was filed under
#
# Message format from field:
#   [photo attached]
#   "Brown coat west wall complete. Moving to east side tomorrow."
#
# Bot reply:
#   "✅ Filed under: 495 Hartford Apartments
#    📍 1441 W 5th St, Los Angeles
#    📸 Photo saved to project files"

module Api
  module V1
    class TelegramWebhookController < ApplicationController
      skip_before_action :authenticate_user!
      before_action :verify_telegram_request

      # POST /api/v1/telegram/webhook
      def webhook
        update = params.permit!.to_h
        message = update.dig("message")

        return head :ok unless message

        chat_id = message.dig("chat", "id")
        text = message["text"] || message["caption"] || ""
        photo = message.dig("photo")&.last # Largest photo size
        sender = message.dig("from")
        sender_name = [sender&.dig("first_name"), sender&.dig("last_name")].compact.join(" ")

        # Process photo if present
        photo_data = nil
        gps_coords = nil

        if photo
          file_id = photo["file_id"]
          photo_data = download_telegram_photo(file_id)
          gps_coords = extract_gps_from_photo(photo_data) if photo_data
        end

        # Geocode and match project
        geocoded_address = nil
        matched_project = nil

        if gps_coords
          geocoded_address = reverse_geocode(gps_coords[:latitude], gps_coords[:longitude])
          matched_project = match_project_by_address(geocoded_address) if geocoded_address
        end

        if matched_project
          # Create the field update
          field_update = FieldUpdate.create!(
            project: matched_project,
            sender_name: sender_name,
            sender_role: "Field",
            message: text,
            photo: photo_data, # ActiveStorage attachment
            latitude: gps_coords&.dig(:latitude),
            longitude: gps_coords&.dig(:longitude),
            geocoded_address: geocoded_address,
            source: "telegram",
            telegram_chat_id: chat_id,
            auto_matched: true
          )

          # Reply to user
          send_telegram_message(chat_id, <<~MSG)
            ✅ Filed under: #{matched_project.name}
            📍 #{geocoded_address || 'Location detected'}
            #{photo_data ? '📸 Photo saved to project files' : ''}
            🕐 #{Time.current.strftime('%I:%M %p')}
          MSG
        else
          # Could not match — ask user to specify project
          projects_list = Project.active.map { |p| "• #{p.name} (#{p.project_number})" }.join("\n")
          send_telegram_message(chat_id, <<~MSG)
            ⚠️ Couldn't auto-detect the project from your location.

            Reply with the project number:
            #{projects_list}
          MSG

          # Store pending update in cache for follow-up
          Rails.cache.write(
            "telegram_pending:#{chat_id}",
            { text: text, photo_data: photo_data, gps_coords: gps_coords, sender_name: sender_name },
            expires_in: 1.hour
          )
        end

        head :ok
      end

      private

      def verify_telegram_request
        # In production, verify the request comes from Telegram
        # using a secret token set in the webhook URL
        secret = request.headers["X-Telegram-Bot-Api-Secret-Token"]
        expected = ENV["TELEGRAM_WEBHOOK_SECRET"]

        if expected.present? && secret != expected
          head :unauthorized
        end
      end

      def download_telegram_photo(file_id)
        token = ENV["TELEGRAM_BOT_TOKEN"]
        return nil unless token

        # Get file path from Telegram
        file_info = HTTParty.get("https://api.telegram.org/bot#{token}/getFile?file_id=#{file_id}")
        file_path = file_info.dig("result", "file_path")
        return nil unless file_path

        # Download the file
        HTTParty.get("https://api.telegram.org/file/bot#{token}/#{file_path}").body
      end

      def extract_gps_from_photo(photo_data)
        # Use MiniExiftool or exifr gem to extract GPS coordinates
        # from the photo's EXIF data
        require "exifr/jpeg"
        temp = Tempfile.new(["photo", ".jpg"])
        temp.binmode
        temp.write(photo_data)
        temp.rewind

        exif = EXIFR::JPEG.new(temp.path)
        if exif.gps
          { latitude: exif.gps.latitude, longitude: exif.gps.longitude }
        end
      rescue StandardError
        nil
      ensure
        temp&.close
        temp&.unlink
      end

      def reverse_geocode(lat, lng)
        # Use Nominatim (OpenStreetMap) for free reverse geocoding
        response = HTTParty.get(
          "https://nominatim.openstreetmap.org/reverse",
          query: { format: "json", lat: lat, lon: lng, addressdetails: 1 },
          headers: { "User-Agent" => "SWS-Operations/1.0" }
        )
        response["display_name"]
      rescue StandardError
        nil
      end

      def match_project_by_address(address)
        return nil unless address

        normalized = address.downcase.gsub(/[,.\-#]/, " ").squish
        tokens = normalized.split(" ").select { |t| t.length > 1 }

        best_match = nil
        best_score = 0

        Project.active.find_each do |project|
          proj_tokens = project.address.downcase.gsub(/[,.\-#]/, " ").squish.split(" ").select { |t| t.length > 1 }
          matched = proj_tokens.count { |t| tokens.any? { |gt| gt == t || gt.include?(t) || t.include?(gt) } }
          score = proj_tokens.any? ? matched.to_f / proj_tokens.length : 0

          # Boost if street number matches
          street_num = project.address.match(/^\d+/)
          score += 0.2 if street_num && normalized.include?(street_num[0])

          if score > 0.3 && score > best_score
            best_match = project
            best_score = score
          end
        end

        best_match
      end

      def send_telegram_message(chat_id, text)
        token = ENV["TELEGRAM_BOT_TOKEN"]
        return unless token

        HTTParty.post(
          "https://api.telegram.org/bot#{token}/sendMessage",
          body: { chat_id: chat_id, text: text, parse_mode: "HTML" }.to_json,
          headers: { "Content-Type" => "application/json" }
        )
      end
    end
  end
end
