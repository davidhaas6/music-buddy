import { FunctionComponent, useState, forwardRef, useEffect, useCallback } from "react";

import { TiMediaRecord, TiMediaRecordOutline, TiMediaPauseOutline, TiMediaPlayOutline } from "react-icons/ti";
import AudioManager from "../../logic/AudioManager";
import { IDashboardComponentProps } from "./DshbComp";
import SoundGraph from "./SoundGraph";

const icons = {
  recordOn: <TiMediaRecord size={100} />,
  recordOff: <TiMediaRecordOutline size={100} />,
  pauseOn: <TiMediaPlayOutline size={100} />,
  pauseOff: <TiMediaPauseOutline size={100} />
};


export interface IRecorderProps extends IDashboardComponentProps {
  audioManager: AudioManager;
}

const Recorder: FunctionComponent<IRecorderProps> = forwardRef(({ className, style = {}, children, ...props }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundData, setSoundData] = useState(new Float32Array(0));
  const [recording, setRecording] = useState(new Float32Array(0));
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  // display properties
  let recordingIcon = isRecording ? icons.recordOn : icons.recordOff;
  let playPauseIcon = isPlaying ? icons.pauseOff : icons.pauseOn;
  let recordingText = isRecording ? "Recording..." : "  ";

  // functions
  let onPlayPauseClick = () => setIsPlaying(!isPlaying);
  

  let onRecordClick = () => {
    let newRecordingState = !isRecording;
    if (newRecordingState) {
      props.audioManager.startRecording();
      console.log("\n\nstarted\n")
    }
    else {
      props.audioManager.stopRecording();
      console.log("\n\nstopped\n")
    }
    setIsRecording(newRecordingState);
  };
  

  const updateTimeData = () => {
    let timeData = new Float32Array(props.audioManager.getTimeData());
    setSoundData(timeData);

    // let newRecording = new Float32Array(timeData.length + recording.length);
    // newRecording.set(recording);
    // newRecording.set(timeData, recording.length);
    setRecording((prev) => new Float32Array([...Array.from(prev), ...Array.from(timeData)]));
  };

  let updatePeriod =  props.audioManager.FFT_SIZE / props.audioManager.SAMPLE_RATE;


  // start timer when record is hit -- stop it once is record is off
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(updateTimeData, updatePeriod);
      setIntervalId(interval);
    }
    else if (intervalId != null) {
      clearInterval(intervalId);
    }
  }, [isRecording]);


//   console.log(recording.length);

// could use key={soundData[0]} and other keys to only rerender sound graph
  return (
    <div
      {...props}
      style={{ ...style }}
      className={className + " recorder"}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="recorder-controls">
        <div onClick={onRecordClick}>{recordingIcon}</div>
        {/* <p>{recordingText}</p> */}
      </div>

      <SoundGraph soundData={soundData} isRecording={isRecording}/>

      {/* <div onClick={onPlayPauseClick}>{playPauseIcon}</div> */}

      {children}
    </div>
  );
});

export default Recorder;