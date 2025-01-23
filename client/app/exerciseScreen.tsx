//ACTUAL EXERCISE

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
import Lay from '../../../Say66_TestApp/app/(tabs)/_layout';

// Import thumbs up and thumbs down images
const thumbsUpImage =  ImagesAssets.like;  // Modify with your actual path
const thumbsDownImage = ImagesAssets.dislike;// Modify with your actual path

// Recording Section Component
const RecordingSection = ({
  isRecording,
  isTranscribing,
  startRecording,
  stopRecording,
  playRecording,
  playSampleFile,
  word,
  feedbackImage, // Now passing the feedback image
  showTryAgain,
  onTryAgain
}: any) => (
  <View style={styles.topHalf}>
    <View style={styles.buttonGroup}>
      <Text style={[styles.wordText, { color: "brown" }]}>Say: {word}</Text>
      <Image source={ImagesAssets.rabbit} style={styles.rabbitImage} />

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
  // Rabbit state and logic
  const [transcribedSpeechRabbit, setTranscribedSpeechRabbit] = useState("");
  const [isRecordingRabbit, setIsRecordingRabbit] = useState(false);
  const [isTranscribingRabbit, setIsTranscribingRabbit] = useState(false);
  const [RabbitFeedback, setRabbitFeedback] = useState("");
  const [showTryAgainRabbit, setShowTryAgainRabbit] = useState(false);
  const [recordedURIRabbit, setRecordedURIRabbit] = useState<string>("");
  const [feedbackImage, setFeedbackImage] = useState<any>(null); // Added state for feedback image

  const Rabbit = require("../assets/samples/rabbit.wav");

  const isWebFocused = useWebFocus();
  const audioRecordingRefRabbit = useRef<Audio.Recording>(new Audio.Recording());
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

  // Start and stop recording functions for Rabbit
  const startRecordingRabbit = async () => {
    setIsRecordingRabbit(true);
    await recordSpeech(audioRecordingRefRabbit, setIsRecordingRabbit, !!webAudioPermissionsRef.current);
  };

  const stopRecordingRabbit = async () => {
    setIsRecordingRabbit(false);
    try {
      setIsTranscribingRabbit(true);
      const { transcript, recordingUri } = await transcribeSpeech(audioRecordingRefRabbit);
      setTranscribedSpeechRabbit(transcript || "");
      setRecordedURIRabbit(recordingUri || "");
      console.log("transcribed Rabbit attempt", transcript);

      if (transcript && transcript.toLowerCase().trim() === "rabbit") {
        setRabbitFeedback("Correct!");
        setShowTryAgainRabbit(false); // Hide "Try Again" button if correct
        setFeedbackImage(thumbsUpImage); // Show thumbs up image
      } else {
        setRabbitFeedback("Incorrect, try again.");
        setShowTryAgainRabbit(true); // Show "Try Again" button if incorrect
        setFeedbackImage(thumbsDownImage); // Show thumbs down image
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribingRabbit(false);
    }
  };

  const playRecordingRabbit = async () => {
    if (!recordedURIRabbit) {
      console.error("No recording found!");
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedURIRabbit });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the recording Rabbit:", error);
    }
  };

  const playSampleFileRabbit = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(Rabbit);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing the sample file Rabbit:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainInnerContainer, { height }]}>
        <View style={styles.border}>
          <Text style={[styles.titleText, { color: "purple" }]}>Try this word!</Text>

          <RecordingSection
            word="Rabbit"
            isRecording={isRecordingRabbit}
            isTranscribing={isTranscribingRabbit}
            startRecording={startRecordingRabbit}
            stopRecording={stopRecordingRabbit}
            playRecording={playRecordingRabbit}
            playSampleFile={playSampleFileRabbit}
            feedbackImage={feedbackImage} // Passing the feedback image
            showTryAgain={showTryAgainRabbit}
            onTryAgain={() => {
              setRabbitFeedback("");
              setShowTryAgainRabbit(false);
              setFeedbackImage(null); // Reset the image
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
  rabbitImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginVertical: 10,
  },
});
