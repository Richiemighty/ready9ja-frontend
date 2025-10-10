import React from "react";
import { TouchableOpacity, Image, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HeaderRightProfile() {
  const router = useRouter();
  // Could read user avatar from a global store; using placeholder
  return (
    <TouchableOpacity onPress={() => router.push("/buyer/profile")} style={styles.container}>
      <View style={styles.avatar}>
        {/* Place real image when available */}
        <Image
          source={{ uri: "https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff" }}
          style={styles.img}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  img: { width: "100%", height: "100%" },
});
