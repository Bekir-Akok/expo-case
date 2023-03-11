import { StatusBar, View, Dimensions } from "react-native";
import {
  Box,
  Button,
  AspectRatio,
  Center,
  Stack,
  Heading,
  Text,
  Image,
  PlayIcon,
  HStack,
} from "native-base";
import { SafeAreaView } from "react-native-safe-area-context";

const Card = ({ title, subtitle, img, desc, tag, navigation }) => {
  const window = Dimensions.get("window");
  const pressButton = () => navigation.navigate("Movies");

  return (
    <Box alignItems="center">
      <Box
        width={window.width}
        height={window.height}
        rounded="lg"
        overflow="hidden"
        borderColor="coolGray.200"
        borderWidth="1"
        _dark={{
          borderColor: "coolGray.600",
          backgroundColor: "gray.700",
        }}
        _web={{
          shadow: 2,
          borderWidth: 0,
        }}
        _light={{
          backgroundColor: "gray.50",
        }}
      >
        <Box>
          <AspectRatio width={window.width}>
            <Image
              resizeMode="cover"
              source={{
                uri: img,
              }}
              alt="image"
            />
          </AspectRatio>
          <Center
            bg="violet.500"
            _dark={{
              bg: "violet.400",
            }}
            _text={{
              color: "warmGray.50",
              fontWeight: "700",
              fontSize: "xs",
            }}
            position="absolute"
            bottom="0"
            px="3"
            py="1.5"
          >
            {tag}
          </Center>
        </Box>
        <Stack p="4" space={3}>
          <Stack>
            <Button
              width="33%"
              size="sm"
              colorScheme="violet"
              onPress={pressButton}
            >
              <HStack space={2} alignItems="center">
                <Text color="white">Play Video</Text>
                <PlayIcon color="white" />
              </HStack>
            </Button>
          </Stack>
          <Stack space={2}>
            <Heading size="md" ml="-1">
              {title}
            </Heading>
            <Text
              fontSize="xs"
              _light={{
                color: "violet.500",
              }}
              _dark={{
                color: "violet.400",
              }}
              fontWeight="500"
              ml="-0.5"
              mt="-1"
            >
              {subtitle}
            </Text>
          </Stack>
          <Text fontWeight="400">{desc}</Text>
        </Stack>
      </Box>
    </Box>
  );
};

const Details = ({ navigation }) => {
  return (
    <SafeAreaView>
      <View>
        <StatusBar />
        <Card
          navigation={navigation}
          title="Big Buck Bunny"
          subtitle="By Blender Foundation"
          tag="Interactive"
          desc="Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the rabbit ain't no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge."
          img="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/1200px-Big_buck_bunny_poster_big.jpg"
        ></Card>
      </View>
    </SafeAreaView>
  );
};

export default Details;
