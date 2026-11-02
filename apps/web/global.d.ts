// File System Access API: `showDirectoryPicker`는 Chromium 계열에서만 제공되므로 선택적으로 선언한다.
interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}
