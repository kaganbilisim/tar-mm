package com.tarimcepte.app.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Emerald500,
    onPrimary = Emerald950,
    primaryContainer = Emerald900,
    onPrimaryContainer = Emerald100,
    secondary = SoilAmber300,
    onSecondary = SoilBrown900,
    secondaryContainer = SoilBrown700,
    onSecondaryContainer = SoilAmber300,
    background = DarkBackground,
    onBackground = HighContrastTextDark,
    surface = DarkSurface,
    onSurface = HighContrastTextDark,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = Emerald200,
    error = AlertRed,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = Emerald900,
    onPrimary = Color.White,
    primaryContainer = Emerald100,
    onPrimaryContainer = Emerald950,
    secondary = SoilBrown700,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFEF3C7),
    onSecondaryContainer = SoilBrown900,
    background = LightBackground,
    onBackground = HighContrastTextLight,
    surface = LightSurface,
    onSurface = HighContrastTextLight,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = Emerald950,
    error = AlertRed,
    onError = Color.White
)

@Composable
fun TarimCepteTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = TarimTypography,
        content = content
    )
}
