import { createNativeStackNavigator } from "@react-navigation/native-stack";

//local imports
import { Home, Details, Movies } from "@Screens";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Detail" component={Details} />
      <Stack.Screen
        name="Movies"
        component={Movies}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const Router = () => {
  return <StackNavigator />;
};

export default Router;
