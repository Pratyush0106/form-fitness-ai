# FORM mobile installation

FORM now includes a web app manifest, installation button and offline screen.
Deploy the Node app behind HTTPS. On a phone, open the public HTTPS URL in
Chrome (Android) or Safari (iOS) and use the installation option. An installed
web app opens in its own window and uses the same server accounts and data.
`localhost:3000` on a phone points to the phone, not the development computer.

## APK publishing

An APK has not been built: this workspace has no Android SDK and no public
deployment URL was supplied. Installation through a browser is not an APK
download. A production Android package must target the deployed HTTPS site.

Once the public URL is available, package the PWA as a Trusted Web Activity
using Bubblewrap or PWABuilder. Set application ID, version, icon, signing key
and Digital Asset Links for your own domain. Build and test the signed APK on
a device, including login, password reset, recipe details, and back navigation.
Keep the signing key private and preserve it for future updates.

Place the verified signed file at `downloads/form-fitness.apk` inside this
project. The Get the app dialog automatically enables Download Android APK
when the file exists. The server streams it as an Android package attachment.
Downloading alone does not install an APK: Android prompts the user to install.
For production with multiple instances, publish the artifact to each instance
or adapt this route to your release storage.
