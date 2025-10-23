import React, { useState } from "react";
import { Image, View } from "react-native";

const OnlineImage = ({ image, style }: { image: string; style?: Object }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View
      style={{
        ...style,
        overflow: "hidden",
        backgroundColor: "#dedede",
        justifyContent: "center",
      }}
    >
      {loading && (
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ resizeMode: "cover", width: "100%", height: "100%" }}
        />
      )}
      <Image
        style={{ resizeMode: "cover", width: "100%", height: "100%" }}
        source={{ uri: image }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export default OnlineImage;
