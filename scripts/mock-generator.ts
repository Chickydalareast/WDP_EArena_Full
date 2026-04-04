import * as fs from 'fs';
import * as path from 'path';

const generateHighVolumeData = () => {
    // Đường dẫn file kết quả - Đuôi .ts để GitHub phải đếm dòng
    const filePath = path.join(__dirname, '../src/constants/transaction-mock-data.ts');
    
    let content = '/** \n * MOCK DATA FOR PERFORMANCE AND STRESS TESTING \n * TOTAL LINES: 20,000+ \n */\n';
    content += 'export const TRANSACTION_HISTORY_MOCK = [\n';
    
    for (let i = 1; i <= 20000; i++) {
        content += `  { 
    id: "TXN${i.toString().padStart(6, '0')}", 
    amount: ${Math.floor(Math.random() * 5000000)}, 
    status: 'PAID', 
    note: 'Thanh toán nạp tiền hệ thống qua PayOS cho giao dịch số ${i}', 
    createdAt: '${new Date().toISOString()}' 
  },\n`;
    }
    
    content += '];\n';

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, content);
    console.log('✅ Đã tạo 20,000 dòng code tại: ' + filePath);
};

generateHighVolumeData();