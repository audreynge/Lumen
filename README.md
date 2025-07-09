# Lumen
InnovAIte Hackathon 2025 @ Northeastern <br>
Demo video: https://www.youtube.com/watch?v=lcP4n6n1Ke8&ab_channel=AudreyN <br>

## How to start
1. `cd frontend` <br>
2. `npm run dev` (or with sudo) <br>
3. `cd data` <br>
4. `flask --app rest_api.py run`

## Running the iOS App with Xcode (Capacitor + Next.js)

### Prerequisites
- Node.js and npm installed
- Xcode installed (from the Mac App Store)
- CocoaPods installed (`sudo gem install cocoapods`)

### Steps

1. **Build the Next.js App**
   ```sh
   cd frontend
   npm run build
   npm run export
   ```
   This will generate the static files in the `out/` directory.

2. **Set the Correct Web Directory in Capacitor**
   - In `frontend/capacitor.config.ts`, ensure:
     ```ts
     export default {
       // ...other config...
       webDir: 'out',   // MAKE SURE THIS IS **NOT** 'public'
       // ...other config...
     };
     ```

3. **Sync Capacitor with iOS**
   ```sh
   npx cap sync ios
   ```

4. **Install CocoaPods Dependencies**
   ```sh
   cd ios/App
   pod install
   ```

5. **Open the iOS Workspace in Xcode**
   ```sh
   open App.xcworkspace
   ```
   - **Important:** Only open the `.xcworkspace` file, not `.xcodeproj`.

6. **Build and Run the App**
   - In Xcode, select your app's scheme and a simulator/device at the top.
   - Click the play (▶️) button to build and run.

### Troubleshooting
- If the run button is grayed out, make sure you have only the workspace open, not the project file.
- Wait for Xcode to finish indexing if the run button is still disabled.
- If you add or remove plugins, repeat steps 3 and 4.
- If you see errors about missing Pods, make sure you ran `pod install` in the correct directory (`ios/App`).

---
