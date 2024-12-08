import os
import google.generativeai as genai

genai.configure(api_key="AIzaSyCEwOO9JigcVydONrN-NO2WtSgMvGu05mM")

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-pro",
  generation_config=generation_config,
)

# TODO Make these files available on the local file system
# You may need to update the file paths
files = [
  upload_to_gemini("C:/Users/JAYESH/Downloads/audio.mp3", mime_type="audio/mpeg"),
]

chat_session = model.start_chat(
  history=[
    {
      "role": "user",
      "parts": [
        files[0]
      ],
    },
   
  ]
)

response = chat_session.send_message("convert this to text understand the language and check weater it sounds like distress situation which threathning give only yes or no answer")

print(response.text)