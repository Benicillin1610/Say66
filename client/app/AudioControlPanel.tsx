//ACTUAL AUDIOCONTROL PANEL

// AudioControlPanel.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface AudioControlPanelProps {
  title: string;
  isRecording: boolean;
  isRecordingPlaying: boolean;
  isSamplePlaying: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecordedAudio: () => void;
  onStopRecordingPlaying: () => void;
  onPlaySampleFile: () => void;
  onStopSamplePlaying: () => void;
}

const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  title,
  isRecording,
  isRecordingPlaying,
  isSamplePlaying,
  onStartRecording,
  onStopRecording,
  onPlayRecordedAudio,
  onStopRecordingPlaying,
  onPlaySampleFile,
  onStopSamplePlaying,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Text style={[styles.centerText, { color: "brown" }]}>{title}</Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={isRecording ? onStopRecording : onStartRecording}
      >
        <Ionicons
          name={isRecording ? "stop-circle" : "mic-circle"}
          size={30}
          color={isRecording ? "red" : "green"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={isRecordingPlaying ? onStopRecordingPlaying : onPlayRecordedAudio}
      >
        <Ionicons
          name={isRecordingPlaying ? "stop-circle" : "play-circle"}
          size={30}
          color={isRecordingPlaying ? "red" : "blue"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={isSamplePlaying ? onStopSamplePlaying : onPlaySampleFile}
      >
        <Ionicons
          name={isSamplePlaying ? "stop-circle" : "musical-notes-outline"}
          size={30}
          color={isSamplePlaying ? "red" : "orange"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  centerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AudioControlPanel;
