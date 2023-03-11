import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import { Text } from "native-base";
import * as ScreenOrientation from "expo-screen-orientation";
import { ResizeMode } from "expo-av";
import { setStatusBarHidden } from "expo-status-bar";
import {
  PanGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";
import LottieView from "lottie-react-native";
import Animated, { FadeIn, Keyframe } from "react-native-reanimated";
import convertToProxyURL from "react-native-video-cache";

//local imports
import { VideoPlayer } from "@Components/organisms";
import Animation from "../../../assets/json-animate/lf30_editor_sakmypz4.json";

const uri = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
const uri1 = "https://akok-service.com/wp-content/uploads/2022/12/Ship.mp4";
const uri2 = "https://akok-service.com/wp-content/uploads/2022/12/Forest_1.mp4";
const uri3 = "https://akok-service.com/wp-content/uploads/2022/12/Forest_2.mp4";

const Images = {
  red: require("../../../assets/red.png"),
  yellow: require("../../../assets/yellow.png"),
  green: require("../../../assets/green.png"),
};

const Source = {
  1: { uri: convertToProxyURL(uri) },
  2: { uri: convertToProxyURL(uri1) },
  3: { uri: convertToProxyURL(uri2) },
  4: { uri: convertToProxyURL(uri3) },
};

const exitAnimation = new Keyframe({
  0: {
    originY: 0,
  },
  100: {
    originY: -100,
  },
});

//balon animation
const Ballons = ({ setStep, setPlayAnimation }) => {
  const [shape, setShape] = useState(["red", "yellow", "green"]);
  const [random, setRandom] = useState(
    ["red", "yellow", "green"].sort((a, b) => 0.5 - Math.random())
  );

  const picker = (x) => {
    if (x === random[0]) {
      setRandom(random.filter((z) => z !== random[0]));
      setShape(shape.map((y) => (y === x ? "" : y)));
    }
  };

  useEffect(() => {
    if (random.length == 0) {
      setTimeout(() => {
        setPlayAnimation(false);
        setStep(3);
      }, 1000);
    }
  }, [random.length, shape.length]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {shape.map((x, i) =>
          x == "" ? (
            <View key={i} style={{ width: 64.8, height: 97.2 }}></View>
          ) : (
            <Pressable key={i} onPress={() => picker(x)}>
              <Animated.Image
                source={Images[x]}
                style={{ width: 64.8, height: 97.2 }}
                entering={FadeIn}
                exiting={exitAnimation}
                alt="baloons"
              />
            </Pressable>
          )
        )}
      </View>
      <View style={styles.textContainer}>
        {random.map((x, i) => (
          <View key={x}>
            {i == 0 ? (
              <Text style={[styles.text, { color: `${x}` }]}>
                {x.toUpperCase()} BALLON.
              </Text>
            ) : null}
          </View>
        ))}
        {random.length == 0 ? (
          <Text style={styles.text}>Congratulations brat!!</Text>
        ) : null}
      </View>
    </View>
  );
};

//wires animation
const Wires = ({ setStep }) => {
  const ref = useRef();
  const [lines, setLines] = useState([true, true, true, true]);

  const onHandleChange = (i) =>
    setLines(lines.map((line, ind) => (ind === i ? false : line)));
  const animationFinished = (i) =>
    setLines(lines.map((line, ind) => (ind === i ? true : line)));

  const handleGesture = (evt) => {
    const { nativeEvent } = evt;
    if (nativeEvent.velocityY > 0) setStep(4);
  };

  return (
    <View style={styles.container}>
      <View style={styles.lineContainer}></View>
      <View style={styles.lineContainer}></View>
      <View style={styles.lineContainer}></View>
      <PanGestureHandler onGestureEvent={handleGesture} minDist={80}>
        <View style={styles.lineContainer}>
          {lines.map((_, i) => {
            return (
              <View key={i} style={{ width: "100%" }}>
                {_ ? (
                  <TapGestureHandler
                    onHandlerStateChange={() => onHandleChange(i)}
                  >
                    <View style={styles.line}></View>
                  </TapGestureHandler>
                ) : (
                  <LottieView
                    ref={ref}
                    style={styles.animate}
                    source={Animation}
                    onAnimationFinish={() => animationFinished(i)}
                    autoPlay={true}
                    loop={false}
                  />
                )}
              </View>
            );
          })}
        </View>
      </PanGestureHandler>
    </View>
  );
};

const Movies = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [playAnimation, setPlayAnimation] = useState(null);
  const animatePlaying = step == 2 || step == 3 ? true : false;

  //player onChange handler
  const playerHandleChange = (status) => {
    const { isLooping, isBuffering, isPlaying, didJustFinish } = status;
    //decide whether to show animation or not
    !!isLooping && !isBuffering && !!isPlaying && setPlayAnimation(true);

    //update step when video finished
    if ((step == 1 || step == 4) && didJustFinish) {
      step === 1
        ? setStep(2)
        : step === 4
        ? navigation.navigate("Detail")
        : null;
    }
  };

  //locks the screen when player is buffering
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setStatusBarHidden(true, "none");

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setStatusBarHidden(false, "fade");
    };
  }, []);

  return (
    <VideoPlayer
      navigation={navigation}
      slider={{ visible: !animatePlaying }}
      timeVisible={!animatePlaying}
      autoHidePlayer={true}
      playbackCallback={playerHandleChange}
      videoProps={{
        shouldPlay: true,
        resizeMode: ResizeMode.COVER,
        source: Source[step],
        isLooping: animatePlaying,
      }}
      style={styles.video}
      fullscreen={{
        inFullscreen: true,
        visible: false,
      }}
      childrenAnimation={
        step == 2 && !!playAnimation ? (
          <Ballons setStep={setStep} setPlayAnimation={setPlayAnimation} />
        ) : step == 3 && !!playAnimation ? (
          <Wires setStep={setStep} setPlayAnimation={setPlayAnimation} />
        ) : null
      }
    />
  );
};

export default Movies;

const styles = StyleSheet.create({
  video: {
    videoBackgroundColor: "black",
    height: Dimensions.get("window").width,
    width: Dimensions.get("window").height,
  },
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  textContainer: {
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 22,
  },
  lineContainer: {
    width: "100%",
    position: "relative",
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  line: {
    width: "100%",
    height: 5,
    backgroundColor: "white",
  },
  animate: {
    width: "100%",
    /*     position: "absolute",
    top: -20,
    left: 0, */
  },
});
