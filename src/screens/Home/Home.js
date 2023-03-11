import { StatusBar, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box, Image, AspectRatio } from "native-base";

const Home = ({ navigation }) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <StatusBar />
        <Pressable onPress={() => navigation.navigate("Detail")}>
          <Box
            width="40%"
            rounded="3xl"
            borderColor="coolGray.200"
            borderWidth="1"
          >
            <AspectRatio>
              <Image
                height={200}
                resizeMode="cover"
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/1200px-Big_buck_bunny_poster_big.jpg",
                }}
                alt="Alternate Text"
              />
            </AspectRatio>
          </Box>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { margin: 15 },
});

export default Home;
