import { Audio } from "expo-av";
import { MutableRefObject } from "react";

export const playSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>,
  setSound: (sound: Audio.Sound | null) => void
) => {
  try {
    // Stop any existing sound before playing the new one
    if (audioRecordingRef?.current) {
      await audioRecordingRef?.current.stopAndUnloadAsync();
    }

    // Get the URI of the recorded audio
    const recordingUri = audioRecordingRef?.current?.getURI();

    if (recordingUri) {
      // Create a sound instance from the URI
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });

      // Set the sound to the state (for future control like replay)
      setSound(sound);

      // Play the sound
      await sound.playAsync();
    } else {
      console.error("No recording found to play");
    }
  } catch (error) {
    console.error("Failed to play speech", error);
  }
};
