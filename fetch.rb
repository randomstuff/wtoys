#!/usr/bin/env ruby

require "net/http"
require "uri"
require "nokogiri"

# Fetch
uri = URI.parse("http://octodex.github.com/");
response = Net::HTTP.get_response(uri);
html = Nokogiri::XML::parse(response.body);
File.open("icon-lists/octodex.uris", 'w') do |f|
  html.css("img[data-src]").each do |img|  
    f.write(img["data-src"])
    f.write "\n"
end
end
