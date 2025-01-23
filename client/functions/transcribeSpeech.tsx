import { Audio } from "expo-av";
import { MutableRefObject } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { readBlobAsBase64 } from "./readBlobAsBase64";

// Adjusted return type to return both transcript and recording URI
export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>
): Promise<{ transcript: string | undefined; recordingUri: string | undefined }> => {
  try {
    // Set audio mode to prevent recording interference
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true
    });

    // Check if the recording is prepared
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (isPrepared) {
      // Stop and unload the recording
      await audioRecordingRef?.current?.stopAndUnloadAsync();

      // Get the URI of the recorded audio
      const recordingUri = audioRecordingRef?.current?.getURI() || "";
      //console.log("uri from transcribe.tsx is: ", recordingUri);
      let base64Uri = "";

      // If running on web, convert URI to base64
      if (Platform.OS === "web") {
        const blob = await fetch(recordingUri).then((res) => res.blob());
        const foundBase64 = (await readBlobAsBase64(blob)) as string;
        // Remove the prefix from the base64 string
        const removedPrefixBase64 = foundBase64.split("base64,")[1];
        base64Uri = removedPrefixBase64;
      } else {
        // For other platforms, read the URI as base64
        base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const dataUrl = base64Uri;

      // Reinitialize the recording object
      audioRecordingRef.current = new Audio.Recording();

      // Audio configuration for different platforms
      const audioConfig = {
        encoding:
          Platform.OS === "android"
            ? "AMR_WB"
            : Platform.OS === "web"
            ? "WEBM_OPUS"
            : "LINEAR16",
        sampleRateHertz:
          Platform.OS === "android"
            ? 16000
            : Platform.OS === "web"
            ? 48000
            : 41000,
        languageCode: "en-US",
      };

      // If both recordingUri and base64 dataUrl exist, send to server
      if (recordingUri && dataUrl) {
        const rootOrigin =
          Platform.OS === "android"
            ? "10.0.2.2"
            : Device.isDevice
            ? process.env.LOCAL_DEV_IP || "localhost"
            : "localhost";
        const serverUrl = `http://${rootOrigin}:4000`;

        // Send the audio data to the server for transcription
        const serverResponse = await fetch(`${serverUrl}/speech-to-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioUrl: dataUrl, config: audioConfig }),
        })
          .then((res) => res.json())
          .catch((e: Error) => console.error(e));

        // Get the transcription results from the server response
        const results = serverResponse?.results;
        if (results) {
          const transcript = results?.[0].alternatives?.[0].transcript;
          if (!transcript) return { transcript: undefined, recordingUri: undefined };

          // Return both the transcript and recording URI
          return { transcript, recordingUri };
        } else {
          console.error("No transcript found");
          return { transcript: undefined, recordingUri: undefined };
        }
      } else {
        // Explicit return statement if URI or dataUrl are missing
        return { transcript: undefined, recordingUri: undefined };
      }
    } else {
      console.error("Recording must be prepared prior to unloading");
      return { transcript: undefined, recordingUri: undefined };
    }
  } catch (e) {
    console.error("Failed to transcribe speech!", e);
    // Return default values if error occurs
    return { transcript: undefined, recordingUri: undefined };
  }
};
