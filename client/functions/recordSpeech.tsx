import React, { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";

export const recordSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  alreadyReceivedPermission: boolean
) => {
  try {
    // Configure the audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Reinitialize the recording instance if a previous recording is done
    if (audioRecordingRef?.current?._isDoneRecording) {
      audioRecordingRef.current = new Audio.Recording();
    }

    let permissionResponse: Audio.PermissionResponse | null = null;

    // Request permissions on non-web platforms
    if (Platform.OS !== "web") {
      permissionResponse = await Audio.requestPermissionsAsync();
    }

    // Proceed only if permissions are granted
    if (alreadyReceivedPermission || permissionResponse?.status === "granted") {
      setIsRecording(true);

      // Check current recording status
      const recordingStatus = await audioRecordingRef?.current?.getStatusAsync();
      if (!recordingStatus?.canRecord) {
        audioRecordingRef.current = new Audio.Recording();

        // Define recording options for high-quality audio
        const recordingOptions = {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            extension: ".amr",
            outputFormat: Audio.AndroidOutputFormat.AMR_WB,
            audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
          },
          ios: {
            extension: ".caf",
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        };

        // Prepare and start the recording
        await audioRecordingRef.current.prepareToRecordAsync(recordingOptions);
        await audioRecordingRef.current.startAsync();
      }
    } else {
      throw new Error("Permission to access the microphone is not granted.");
    }
  } catch (error) {
    console.error("Error while recording audio:", error);
  }
};
