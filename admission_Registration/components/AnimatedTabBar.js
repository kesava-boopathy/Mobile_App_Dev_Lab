// components/AnimatedTabBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;

        const isFocused = state.index === index;

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: withSpring(isFocused ? 1.2 : 1) }],
          opacity: withSpring(isFocused ? 1 : 0.7),
        }));

        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabButton}
          >
            <Animated.Text style={[styles.tabLabel, animatedStyle]}>
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2b2d42',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
