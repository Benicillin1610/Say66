//ACTUAL PRACTISEE

import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { recordSpeech } from "@/functions/recordSpeech";
import useWebFocus from "@/hooks/useWebFocus";
import { VoiceAssets } from "../assets/samples/allSamples";
import { ImagesAssets } from "../assets/images/allImages";
import Lay from "../../../Say66_TestApp/app/(tabs)/_layout";

// Import thumbs up and thumbs down images
const thumbsUpImage = ImagesAssets.like; // Modify with your actual path
const thumbsDownImage = ImagesAssets.dislike; // Modify with your actual path

// Recording Section Component
const RecordingSection = ({
  isRecording,
  isTranscribing,
  startRecording,
  stopRecording,
  playRecording,
  playSampleFile,
  word,
  feedbackImage, // Correct prop name
  showTryAgain,
  onTryAgain,
}: any) => (
  <View style={styles.topHalf}>
    <View style={styles.buttonGroup}>
      <Text style={[styles.wordText, { color: "brown" }]}>Say: {word}</Text>

      <View style={styles.microphoneContainer}>
        <TouchableOpacity
          style={{
            ...styles.microphoneButton,
            opacity: isRecording || isTranscribing ? 0.5 : 1,
          }}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isRecording || isTranscribing}
        >
          {isRecording ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="microphone" size={20} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playRecordingButton}
          onPress={playRecording}
          disabled={isRecording || isTranscribing}
        >
          <FontAwesome name="play-circle" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playSampleButton}
          onPress={playSampleFile}
        >
          <FontAwesome name="volume-up" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Feedback and Try Again as Overlay */}
    {feedbackImage && (
      <View style={styles.overlay}>
        <Image source={feedbackImage} style={styles.feedbackImage} />
        {showTryAgain && (
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={onTryAgain}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

// Feedback Section Component
const FeedbackSection = ({ feedbackImage, showTryAgain, onTryAgain }: any) => (
  <View style={styles.feedbackContainer}>
    <Image source={feedbackImage} style={styles.feedbackImage} />
    {showTryAgain && (
      <TouchableOpacity
        style={styles.tryAgainButton}
        onPress={onTryAgain}
      >
        <Text style={styles.tryAgainText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function ExerciseScreen() {
  // Ray state and logic
  const [transcribedSpeechRay, setTranscribedSpeechRay] = useState("");
  const [isRecordingRay, setIsRecordingRay] = useState(false);
  const [isTranscribingRay, setIsTranscribingRay] = useState(false);
  const [RayFeedback, setRayFeedback] = useState("");
  const [showTryAgainRay, setShowTryAgainRay] = useState(false);
  const [recordedURIRay, setRecordedURIRay] = useState<string>("");
  const [feedbackImageRay, setFeedbackImageRay] = useState<any>(null); // Added state for feedback image

  // Lay state and logic
  const [transcribedSpeechLay, setTranscribedSpeechLay] = useState("");
  const [isRecordingLay, setIsRecordingLay] = useState(false);
  const [isTranscribingLay, setIsTranscribingLay] = useState(false);
  const [LayFeedback, setLayFeedback] = useState("");
  const [showTryAgainLay, setShowTryAgainLay] = useState(false);
  const [recordedURILay, setRecordedURILay] = useState<string>("");
  const [feedbackImageLay, setFeedbackImageLay] = useState<any>(null); // Added state for feedback image

  const Ray = require("../assets/samples/ray.wav");
  const Lay = require("../assets/samples/lay.wav");

  const isWebFocused = useWebFocus();
  const audioRecordingRefRay = useRef<Audio.Recording>(new Audio.Recording());
  const audioRecordingRefLay = useRef<Audio.Recording>(new Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (isWebFocused) {
      const getMicAccess = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        webAudioPermissionsRef.current = permissions;
      };
      if (!webAudioPermissionsRef.current) getMicAccess();
    } else {
      if (webAudioPermissionsRef.current) {
        webAudioPermissionsRef.current
          .getTracks()
          .forEach((track) => track.stop());
        webAudioPermissionsRef.current = null;
      }
    }
  }, [isWebFocused]);

  // Start and stop recording functions for Ray and Lay
  const startRecordingRay = async () => {
    setIsRecordingRay(true);
    await recordSpeech(audioRecordingRefRay, setIsRecordingRay, !!webAudioPermissionsRef.current);
  };

  const stopRecordingRay = async () => {
    setIsRecordingRay(false);
    try {
      setIsTranscribingRay(true);
      const { transcript, recordingUri } = await transcribeSpeech(audioRecordingRefRay);
      setTranscribedSpeechRay(transcript || "");
      setRecordedURIRay(recordingUri || "");
      console.log("transcribed ray attempt", transcript);

      if (transcript && transcript.toLowerCase().trim() === "ray") {
        setRayFeedback("Correct!");
        setShowTryAgainRay(false); // Hide "Try Again" button if correct
        setFeedbackImageRay(thumbsUpImage); // Show thumbs up image
      } else {
        setRayFeedback("Incorrect, try again.");
        setShowTryAgainRay(true); // Show "Try Again" button if incorrect
        setFeedbackImageRay(thumbsDownImage); // Show thumbs down image
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribingRay(false);
    }
  };

  const playRecordingRay = async () => {
    if (!recordedURIRay) {
      console.error("No recording found!");
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedURIRay });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the recording Ray:", error);
    }
  };

  const playSampleFileRay = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(Ray);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the sample file Ray:", error);
    }
  };

  // Start and stop recording functions for Lay
  const startRecordingLay = async () => {
    setIsRecordingLay(true);
    await recordSpeech(audioRecordingRefLay, setIsRecordingLay, !!webAudioPermissionsRef.current);
  };

  const stopRecordingLay = async () => {
    setIsRecordingLay(false);
    try {
      setIsTranscribingLay(true);
      const { transcript, recordingUri } = await transcribeSpeech(audioRecordingRefLay);
      setTranscribedSpeechLay(transcript || "");
      setRecordedURILay(recordingUri || "");
      console.log("transcribed lay attempt", transcript);

      if (transcript && transcript.toLowerCase().trim() === "lay") {
        setLayFeedback("Correct!");
        setShowTryAgainLay(false); // Hide "Try Again" button if correct
        setFeedbackImageLay(thumbsUpImage); // Show thumbs up image
      } else {
        setLayFeedback("Incorrect, try again.");
        setShowTryAgainLay(true); // Show "Try Again" button if incorrect
        setFeedbackImageLay(thumbsDownImage); // Show thumbs down image
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribingLay(false);
    }
  };

  const playRecordingLay = async () => {
    if (!recordedURILay) {
      console.error("No recording found!");
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedURILay });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the recording Lay:", error);
    }
  };

  const playSampleFileLay = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(Lay);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the sample file Lay:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainInnerContainer, { height }]}>
        <View style={styles.border}>
          <Text style={[styles.titleText, { color: "purple" }]}>Have a go!</Text>

          <RecordingSection
            word="Ray"
            isRecording={isRecordingRay}
            isTranscribing={isTranscribingRay}
            startRecording={startRecordingRay}
            stopRecording={stopRecordingRay}
            playRecording={playRecordingRay}
            playSampleFile={playSampleFileRay}
            feedbackImage={feedbackImageRay} // Ensure correct prop
            showTryAgain={showTryAgainRay}
            onTryAgain={() => {
              setRayFeedback("");
              setShowTryAgainRay(false);
              setFeedbackImageRay(null); // Reset the image
            }}
          />

          <RecordingSection
            word="Lay"
            isRecording={isRecordingLay}
            isTranscribing={isTranscribingLay}
            startRecording={startRecordingLay}
            stopRecording={stopRecordingLay}
            playRecording={playRecordingLay}
            playSampleFile={playSampleFileLay}
            feedbackImage={feedbackImageLay} // Ensure correct prop
            showTryAgain={showTryAgainLay}
            onTryAgain={() => {
              setLayFeedback("");
              setShowTryAgainLay(false);
              setFeedbackImageLay(null); // Reset the image
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  mainInnerContainer: {
    gap: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  wordText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  microphoneButton: {
    backgroundColor: "green",
    width: 40,
    height: 40,
    marginTop: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  playRecordingButton: {
    backgroundColor: "blue",
    width: 40,
    height: 40,
    marginTop: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  playSampleButton: {
    backgroundColor: "orange",
    width: 40,
    height: 40,
    marginTop: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  border: {
    width: "80%",
    borderWidth: 10,
    borderColor: "purple",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 20,
    paddingVertical: 15,
    flex: 1,
  },
  buttonGroup: {
    flexDirection: "column",
    gap: 15,
    marginTop: 50,
    alignItems: "center",
  },
  topHalf: {
    width: "100%",
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  microphoneContainer: {
    flexDirection: "row",
    gap: 50,
    marginTop: 30,
    alignItems: "center",
  },
  feedbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 10,
    padding: 20,
  },
  feedbackImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  tryAgainButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "red",
    borderRadius: 10,
  },
  tryAgainText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
