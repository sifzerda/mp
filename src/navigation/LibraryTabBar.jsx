// src/navigation/LibraryTabBar.jsx

import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";

import {
    Music,
    Users,
    Disc3,
    Heart,
    ListMusic,
} from "lucide-react-native";

import MiniPlayer from "../components/MiniPlayer";
import useThemedStyles from "../theme/useThemedStyles";

const ICONS = {
    Songs: Music,
    Artists: Users,
    Albums: Disc3,
    Favorites: Heart,
    Playlists: ListMusic,
};

export default function LibraryTabBar({
    state,
    descriptors,
    navigation,
}) {
    const { colors, styles } =
        useThemedStyles(createStyles);

    return (
        <View style={styles.container}>
            <MiniPlayer
                onOpenPlayer={() =>
                    navigation.navigate("NowPlaying")
                }
            />

            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } =
                        descriptors[route.key];

                    const focused = state.index === index;

                    const Icon = ICONS[route.name] || Music;

                    const color = focused
                        ? colors.primary
                        : colors.muted;

                    const label =
                        options.title || route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!focused && !event.defaultPrevented) {
                            navigation.navigate(
                                route.name,
                                route.params
                            );
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            accessibilityRole="tab"
                            accessibilityState={{
                                selected: focused,
                            }}
                            style={styles.tab}
                        >
                            {focused && (
                                <View style={styles.indicator} />
                            )}

                            <Icon
                                color={color}
                                size={23}
                                strokeWidth={focused ? 2.5 : 1.8}
                            />

                            <Text
                                style={[
                                    styles.label,
                                    { color },
                                ]}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
        },

        tabBar: {
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingVertical: 8,
        },

        tab: {
            flex: 1,
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
        },

        label: {
            fontSize: 11,
            fontWeight: "600",
        },

        indicator: {
            position: "absolute",
            top: -8,
            width: 30,
            height: 3,
            borderRadius: 3,
            backgroundColor: colors.primary,
        },
    });