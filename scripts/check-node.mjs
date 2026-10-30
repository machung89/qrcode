// Chạy trước dev/build/start: better-sqlite3 cần Node >= 22, Node cũ sẽ làm server sập khi ghi CSDL.
const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  console.error(`
  ✗ Đang dùng Node ${process.versions.node}, website cần Node 22 hoặc 24 LTS.
    1. Cài Node 24 LTS tại https://nodejs.org (hoặc: winget install OpenJS.NodeJS.LTS)
    2. Mở lại cửa sổ terminal / VS Code, kiểm tra: node -v
    3. Chạy: npm rebuild better-sqlite3
`);
  process.exit(1);
}
