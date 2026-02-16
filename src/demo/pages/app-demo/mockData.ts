/**
 * @file Mock data for app demos
 */

// =====================================================================
// Design Demo Mock Data
// =====================================================================

export type DesignLayer = {
  id: string;
  label: string;
  type: "frame" | "rectangle" | "text" | "ellipse" | "image" | "group";
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  order: number;
};

export const designLayers: DesignLayer[] = [
  { id: "1", label: "App Icon 1024x1024", type: "frame", visible: true, locked: false, parentId: null, order: 0 },
  { id: "2", label: "Background", type: "rectangle", visible: true, locked: false, parentId: "1", order: 0 },
  { id: "3", label: "Gradient Fill", type: "rectangle", visible: true, locked: false, parentId: "1", order: 1 },
  { id: "4", label: "Icon Shape", type: "group", visible: true, locked: false, parentId: "1", order: 2 },
  { id: "5", label: "Circle", type: "ellipse", visible: true, locked: false, parentId: "4", order: 0 },
  { id: "6", label: "Inner Ring", type: "ellipse", visible: true, locked: false, parentId: "4", order: 1 },
  { id: "7", label: "Glyph", type: "text", visible: true, locked: false, parentId: "4", order: 2 },
  { id: "8", label: "Highlight", type: "ellipse", visible: false, locked: false, parentId: "1", order: 3 },
];

export const designPages = [
  { id: "page1", label: "App Icons" },
  { id: "page2", label: "Splash Screens" },
  { id: "page3", label: "Components" },
];

export type DesignTool = {
  id: string;
  label: string;
  shortcut?: string;
};

export const designTools: DesignTool[] = [
  { id: "move", label: "Move", shortcut: "V" },
  { id: "frame", label: "Frame", shortcut: "F" },
  { id: "rectangle", label: "Rectangle", shortcut: "R" },
  { id: "ellipse", label: "Ellipse", shortcut: "O" },
  { id: "line", label: "Line", shortcut: "L" },
  { id: "pen", label: "Pen", shortcut: "P" },
  { id: "text", label: "Text", shortcut: "T" },
];

// =====================================================================
// IDE Demo Mock Data
// =====================================================================

export type IDEFile = {
  id: string;
  name: string;
  type: "folder" | "swift" | "json" | "plist" | "asset";
  parentId: string | null;
  order: number;
};

export const ideFiles: IDEFile[] = [
  { id: "1", name: "MyApp", type: "folder", parentId: null, order: 0 },
  { id: "2", name: "Sources", type: "folder", parentId: "1", order: 0 },
  { id: "3", name: "MyAppApp.swift", type: "swift", parentId: "2", order: 0 },
  { id: "4", name: "ContentView.swift", type: "swift", parentId: "2", order: 1 },
  { id: "5", name: "Models", type: "folder", parentId: "2", order: 2 },
  { id: "6", name: "User.swift", type: "swift", parentId: "5", order: 0 },
  { id: "7", name: "Settings.swift", type: "swift", parentId: "5", order: 1 },
  { id: "8", name: "Resources", type: "folder", parentId: "1", order: 1 },
  { id: "9", name: "Assets.xcassets", type: "asset", parentId: "8", order: 0 },
  { id: "10", name: "Info.plist", type: "plist", parentId: "8", order: 1 },
  { id: "11", name: "Tests", type: "folder", parentId: "1", order: 2 },
  { id: "12", name: "MyAppTests.swift", type: "swift", parentId: "11", order: 0 },
];

export const swiftSampleCode = `import SwiftUI

struct ContentView: View {
    @State private var count = 0
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Counter: \\(count)")
                .font(.largeTitle)
                .fontWeight(.bold)
                .scaleEffect(isAnimating ? 1.2 : 1.0)

            HStack(spacing: 16) {
                Button(action: decrement) {
                    Image(systemName: "minus.circle.fill")
                        .font(.title)
                }
                .disabled(count <= 0)

                Button(action: increment) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title)
                }
            }
            .foregroundColor(.blue)
        }
        .padding()
    }

    private func increment() {
        withAnimation(.spring()) {
            count += 1
            isAnimating = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            isAnimating = false
        }
    }

    private func decrement() {
        if count > 0 {
            count -= 1
        }
    }
}

#Preview {
    ContentView()
}`;

export const ideDevices = [
  { id: "mac", label: "My Mac" },
  { id: "iphone15pro", label: "iPhone 15 Pro" },
  { id: "iphone15", label: "iPhone 15" },
  { id: "ipad", label: "iPad Pro 12.9\"" },
  { id: "simulator", label: "iOS Simulator" },
];
