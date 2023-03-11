import React from "react";
import { Audio, Video } from "expo-av";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import Slider from "@react-native-community/slider";

//local imports
import {
  ErrorMessage,
  TouchableButton,
  deepMerge,
  getMinutesSecondsFromMilliseconds,
  styles,
} from "./utils";
import { defaultProps } from "./props";

const VideoPlayer = (tempProps) => {
  const props = deepMerge(defaultProps, tempProps);

  let playbackInstance = null;
  let controlsTimer = null;
  let initialShow = props.defaultControlsVisible;
  const header = props.header;

  const [errorMessage, setErrorMessage] = useState("");
  const controlsOpacity = useRef(
    new Animated.Value(props.defaultControlsVisible ? 1 : 0)
  ).current;
  const [controlsState, setControlsState] = useState(
    props.defaultControlsVisible ? "Visible" : "Hidden"
  );
  const [playbackInstanceInfo, setPlaybackInstanceInfo] = useState({
    position: 0,
    duration: 0,
    state: props.videoProps.source ? "Loading" : "Error",
  });

  // We need to extract ref, because of misstypes in <Slider />
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref: sliderRef, ...sliderProps } = props.slider;
  const screenRatio = props.style.width / props.style.height;

  let videoHeight = props.style.height;
  let videoWidth = videoHeight * screenRatio;

  if (videoWidth > props.style.width) {
    videoWidth = props.style.width;
    videoHeight = videoWidth / screenRatio;
  }

  useEffect(() => {
    setAudio();

    return () => {
      if (playbackInstance) {
        playbackInstance.setStatusAsync({
          shouldPlay: false,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!props.videoProps.source) {
      console.error(
        "[VideoPlayer] `Source` is a required in `videoProps`. " +
          "Check https://docs.expo.io/versions/latest/sdk/video/#usage"
      );
      setErrorMessage("`Source` is a required in `videoProps`");
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        state: "Error",
      });
    } else {
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        state: "Playing",
      });
    }
  }, [props.videoProps.source]);

  const hideAnimation = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: props.animation.fadeOutDuration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setControlsState("Hidden");
      }
    });
  };

  const animationToggle = () => {
    if (controlsState === "Hidden") {
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: props.animation.fadeInDuration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setControlsState("Visible");
        }
      });
    } else if (controlsState === "Visible") {
      hideAnimation();
    }

    if (controlsTimer === null && props.autoHidePlayer) {
      controlsTimer = setTimeout(() => {
        if (
          playbackInstanceInfo.state === "Playing" &&
          controlsState === "Hidden"
        ) {
          hideAnimation();
        }
        if (controlsTimer) {
          clearTimeout(controlsTimer);
        }
        controlsTimer = null;
      }, 2000);
    }
  };

  // Set audio mode to play even in silent mode (like the YouTube app)
  const setAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    } catch (e) {
      props.errorCallback({
        type: "NonFatal",
        message: "Audio.setAudioModeAsync",
        obj: e,
      });
    }
  };

  const updatePlaybackCallback = (status) => {
    props.playbackCallback(status);

    if (status.isLoaded) {
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        position: status.positionMillis,
        duration: status.durationMillis || 0,
        state:
          status.positionMillis === status.durationMillis
            ? "Ended"
            : status.isBuffering
            ? "Buffering"
            : status.shouldPlay
            ? "Playing"
            : "Paused",
      });
      if (
        (status.didJustFinish &&
          controlsState === "Hidden" &&
          !status.isLooping) ||
        (status.isBuffering &&
          controlsState === "Hidden" &&
          initialShow &&
          !status.isLooping)
      ) {
        animationToggle();
        initialShow = false;
      }
    } else {
      if (status.isLoaded === false && status.error) {
        const errorMsg = `Encountered a fatal error during playback: ${status.error}`;
        setErrorMessage(errorMsg);
        props.errorCallback({
          type: "Fatal",
          message: errorMsg,
          obj: {},
        });
      }
    }
  };

  const togglePlay = async () => {
    if (controlsState === "Hidden") {
      return;
    }
    const shouldPlay = playbackInstanceInfo.state !== "Playing";
    if (playbackInstance !== null) {
      await playbackInstance.setStatusAsync({
        shouldPlay,
        ...(playbackInstanceInfo.state === "Ended" && {
          positionMillis: 0,
        }),
      });
      setPlaybackInstanceInfo({
        ...playbackInstanceInfo,
        state: playbackInstanceInfo.state === "Playing" ? "Paused" : "Playing",
      });
      if (shouldPlay) {
        animationToggle();
      }
    }
  };

  if (playbackInstanceInfo.state === "Error") {
    return (
      <View
        style={{
          backgroundColor: props.style.videoBackgroundColor,
          width: videoWidth,
          height: videoHeight,
        }}
      >
        <ErrorMessage style={props.textStyle} message={errorMessage} />
      </View>
    );
  }

  if (playbackInstanceInfo.state === "Loading") {
    return (
      <View
        style={{
          backgroundColor: props.style.controlsBackgroundColor,
          width: videoWidth,
          height: videoHeight,
          justifyContent: "center",
        }}
      >
        {props.icon.loading || (
          <ActivityIndicator {...props.activityIndicator} />
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: props.style.videoBackgroundColor,
        width: videoWidth,
        height: videoHeight,
        maxWidth: "100%",
      }}
    >
      <Video
        style={styles.videoWrapper}
        {...props.videoProps}
        ref={(component) => {
          playbackInstance = component;
          if (props.videoProps.ref) {
            props.videoProps.ref.current = component;
          }
        }}
        onPlaybackStatusUpdate={updatePlaybackCallback}
      />

      {props.childrenAnimation ? (
        <View style={styles.childrenAnimation}>{props.childrenAnimation}</View>
      ) : null}

      {!props.videoProps.isLooping && (
        <>
          <Animated.View
            pointerEvents={controlsState === "Visible" ? "auto" : "none"}
            style={[
              styles.topInfoWrapper,
              {
                opacity: controlsOpacity,
              },
            ]}
          >
            {header}
            <View style={{ margin: 10 }}>
              <MaterialIcons
                name="arrow-back-ios"
                style={{ margin: 10 }}
                size={24}
                color={props.icon.color}
                onPress={() => props.navigation.goBack()}
              />
            </View>
          </Animated.View>

          <TouchableWithoutFeedback onPress={animationToggle}>
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                opacity: controlsOpacity,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: props.style.controlsBackgroundColor,
                  opacity: 0.5,
                }}
              />
              <View
                pointerEvents={controlsState === "Visible" ? "auto" : "none"}
              >
                <View style={styles.iconWrapper}>
                  <TouchableButton onPress={togglePlay}>
                    <View>
                      {playbackInstanceInfo.state === "Buffering" &&
                        (props.icon.loading || (
                          <ActivityIndicator {...props.activityIndicator} />
                        ))}
                      {playbackInstanceInfo.state === "Playing" &&
                        props.icon.pause}
                      {playbackInstanceInfo.state === "Paused" &&
                        props.icon.play}
                      {playbackInstanceInfo.state === "Ended" &&
                        props.icon.replay}
                      {((playbackInstanceInfo.state === "Ended" &&
                        !props.icon.replay) ||
                        (playbackInstanceInfo.state === "Playing" &&
                          !props.icon.pause) ||
                        (playbackInstanceInfo.state === "Paused" &&
                          !props.icon.pause)) && (
                        <MaterialIcons
                          name={
                            playbackInstanceInfo.state === "Playing"
                              ? "pause"
                              : playbackInstanceInfo.state === "Paused"
                              ? "play-arrow"
                              : "replay"
                          }
                          style={props.icon.style}
                          size={props.icon.size}
                          color={props.icon.color}
                        />
                      )}
                    </View>
                  </TouchableButton>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>

          <Animated.View
            pointerEvents={controlsState === "Visible" ? "auto" : "none"}
            style={[
              styles.bottomInfoWrapper,
              {
                opacity: controlsOpacity,
              },
            ]}
          >
            {props.timeVisible && (
              <Text style={[props.textStyle, styles.timeLeft]}>
                {getMinutesSecondsFromMilliseconds(
                  playbackInstanceInfo.position
                )}
              </Text>
            )}
            {props.slider.visible && (
              <Slider
                {...sliderProps}
                style={[styles.slider, props.slider.style]}
                value={
                  playbackInstanceInfo.duration
                    ? playbackInstanceInfo.position /
                      playbackInstanceInfo.duration
                    : 0
                }
                onSlidingStart={() => {
                  if (playbackInstanceInfo.state === "Playing") {
                    togglePlay();
                    setPlaybackInstanceInfo({
                      ...playbackInstanceInfo,
                      state: "Paused",
                    });
                  }
                }}
                onSlidingComplete={async (e) => {
                  const position = e * playbackInstanceInfo.duration;
                  if (playbackInstance) {
                    await playbackInstance.setStatusAsync({
                      positionMillis: position,
                      shouldPlay: true,
                    });
                  }
                  setPlaybackInstanceInfo({
                    ...playbackInstanceInfo,
                    position,
                  });
                }}
              />
            )}
            {props.timeVisible && (
              <Text style={[props.textStyle, styles.timeRight]}>
                {getMinutesSecondsFromMilliseconds(
                  playbackInstanceInfo.duration
                )}
              </Text>
            )}
            {props.mute.visible && (
              <TouchableButton
                onPress={() =>
                  props.mute.isMute
                    ? props.mute.exitMute?.()
                    : props.mute.enterMute?.()
                }
              >
                <View>
                  {props.icon.mute}
                  {props.icon.exitMute}
                  {((!props.icon.mute && props.mute.isMute) ||
                    (!props.icon.exitMute && !props.mute.isMute)) && (
                    <MaterialIcons
                      name={props.mute.isMute ? "volume-up" : "volume-off"}
                      style={props.icon.style}
                      size={props.icon.size / 2}
                      color={props.icon.color}
                    />
                  )}
                </View>
              </TouchableButton>
            )}
            {props.fullscreen.visible && (
              <TouchableButton
                onPress={() =>
                  props.fullscreen.inFullscreen
                    ? props.fullscreen.exitFullscreen()
                    : props.fullscreen.enterFullscreen()
                }
              >
                <View>
                  {!props.fullscreen.inFullscreen && props.icon.fullscreen}
                  {props.fullscreen.inFullscreen && props.icon.exitFullscreen}
                  {((!props.icon.fullscreen &&
                    !props.fullscreen.inFullscreen) ||
                    (!props.icon.exitFullscreen &&
                      props.fullscreen.inFullscreen)) && (
                    <MaterialIcons
                      name={
                        props.fullscreen.inFullscreen
                          ? "fullscreen-exit"
                          : "fullscreen"
                      }
                      style={props.icon.style}
                      size={props.icon.size / 2}
                      color={props.icon.color}
                    />
                  )}
                </View>
              </TouchableButton>
            )}
          </Animated.View>
        </>
      )}
    </View>
  );
};

VideoPlayer.defaultProps = defaultProps;

export default VideoPlayer;
