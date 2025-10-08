// App.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as DocumentPicker from "expo-document-picker";
import { Formik } from "formik";
import * as Yup from "yup";

const Tab = createBottomTabNavigator();

// 🎓 Admission Form Screen
function FormScreen() {
  const [file, setFile] = useState(null);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === "success") {
      setFile(result);
    }
  };

  const admissionSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    course: Yup.string().required("Course is required"),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>College Admission Form</Text>

      <Formik
        initialValues={{ name: "", email: "", course: "" }}
        validationSchema={admissionSchema}
        onSubmit={(values) => {
          alert(`🎓 Submitted Successfully!\n\n${JSON.stringify(values, null, 2)}`);
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={values.name}
              onChangeText={handleChange("name")}
            />
            {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange("email")}
              keyboardType="email-address"
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Course"
              value={values.course}
              onChangeText={handleChange("course")}
            />
            {touched.course && errors.course && <Text style={styles.error}>{errors.course}</Text>}

            <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
              <Text style={styles.fileText}>
                {file ? `📄 ${file.name}` : "Upload Document"}
              </Text>
            </TouchableOpacity>

            <Button title="Submit Application" onPress={handleSubmit} />
          </>
        )}
      </Formik>
    </ScrollView>
  );
}

// 💡 About Screen
function AboutScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>About College</Text>
      <Text style={styles.text}>
        Welcome to the College Admission Portal. Fill your details in the form tab to apply for admission. 
        Upload required documents and submit your application.
      </Text>
    </View>
  );
}

// ⚙️ Settings Screen (Dark Mode Toggle)
function SettingsScreen({ toggleTheme, isDark }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>Toggle between Light and Dark mode</Text>
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: isDark ? "#fff" : "#333" }]}
        onPress={toggleTheme}
      >
        <Text style={{ color: isDark ? "#000" : "#fff" }}>
          Switch to {isDark ? "Light" : "Dark"} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 Animated Tab Wrapper
function AnimatedTabBar({ state, descriptors, navigation, position }) {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;

        const isFocused = state.index === index;
        const scale = useState(new Animated.Value(isFocused ? 1.2 : 1))[0];

        Animated.timing(scale, {
          toValue: isFocused ? 1.2 : 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();

        const onPress = () => navigation.navigate(route.name);

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Animated.Text
              style={[
                styles.tabLabel,
                { color: isFocused ? "#007BFF" : "#888", transform: [{ scale }] },
              ]}
            >
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// 🌙 Main App
export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Form" component={FormScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
        <Tab.Screen
          name="Settings"
          children={() => (
            <SettingsScreen toggleTheme={() => setIsDark(!isDark)} isDark={isDark} />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 40,
    backgroundColor: "#f8f9fa",
    paddingVertical: 200
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  fileButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  fileText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  themeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
});
