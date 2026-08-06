const bcrypt = require('bcryptjs');
const { User, ExpenseCategory, BudgetCategory, Expense } = require('../models');

const seedInitialData = async () => {
  try {
    // 1. Seed Users
    const userCount = await User.count();
    let adminUser;
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        username: 'admin',
        password: hashedPassword,
        full_name: 'ผู้ดูแลระบบสาธารณูปโภค',
        role: 'admin'
      });

      const staffPassword = await bcrypt.hash('staff123', 10);
      await User.create({
        username: 'staff',
        password: staffPassword,
        full_name: 'เจ้าหน้าที่บันทึกข้อมูล',
        role: 'staff'
      });
      console.log('✅ Users seeded: admin / admin123, staff / staff123');
    } else {
      adminUser = await User.findOne({ where: { username: 'admin' } });
    }

    // 2. Seed Expense Categories
    const defaultExpenseCategories = [
      { name: 'ค่าไฟฟ้า', code: 'ELEC', unit: 'บาท' },
      { name: 'ค่าพลังงาน', code: 'ENERGY', unit: 'บาท' },
      { name: 'ค่าน้ำประปา', code: 'WATER', unit: 'บาท' },
      { name: 'ค่าอินเตอร์เน็ต', code: 'INTERNET', unit: 'บาท' },
      { name: 'ค่าโทรศัพท์', code: 'PHONE', unit: 'บาท' },
      { name: 'ค่าไปรษณีย์', code: 'POST', unit: 'บาท' },
      { name: 'ค่าทิ้งขยะ', code: 'WASTE', unit: 'บาท' }
    ];

    for (const cat of defaultExpenseCategories) {
      await ExpenseCategory.findOrCreate({
        where: { code: cat.code },
        defaults: cat
      });
    }
    console.log('✅ Expense categories seeded');

    // 3. Seed Budget Categories
    const defaultBudgetCategories = [
      { name: 'งบประมาณ (ปวช.)', code: 'BUDGET_VOC' },
      { name: 'งบประมาณ (ปวส.)', code: 'BUDGET_DIP' },
      { name: 'เงินรายได้สถานศึกษา', code: 'INST_INCOME' }
    ];

    for (const bCat of defaultBudgetCategories) {
      await BudgetCategory.findOrCreate({
        where: { code: bCat.code },
        defaults: bCat
      });
    }
    console.log('✅ Budget categories seeded');

    // 4. Seed sample expenses if table is empty
    const expenseCount = await Expense.count();
    if (expenseCount === 0 && adminUser) {
      const expCats = await ExpenseCategory.findAll();
      const budCats = await BudgetCategory.findAll();

      const catMap = {};
      expCats.forEach(c => catMap[c.code] = c.id);

      const bCatMap = {};
      budCats.forEach(b => bCatMap[b.code] = b.id);

      const sampleExpenses = [];
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 1, currentYear];

      years.forEach(yr => {
        for (let month = 1; month <= 12; month++) {
          // If current year and month in future, skip
          if (yr === currentYear && month > new Date().getMonth() + 1) continue;

          const monthStr = month < 10 ? `0${month}` : `${month}`;
          const billingDate = `${yr}-${monthStr}-01`;
          const paidDate = `${yr}-${monthStr}-25`;

          // Electricity
          sampleExpenses.push({
            expense_category_id: catMap['ELEC'],
            budget_category_id: bCatMap['BUDGET_VOC'],
            amount: 35000 + Math.floor(Math.random() * 8000),
            billing_month: billingDate,
            paid_date: paidDate,
            invoice_no: `INV-ELEC-${yr}${monthStr}`,
            note: `ค่าไฟฟ้าประจำเดือน ${monthStr}/${yr}`,
            created_by: adminUser.id
          });

          // Water
          sampleExpenses.push({
            expense_category_id: catMap['WATER'],
            budget_category_id: bCatMap['BUDGET_DIP'],
            amount: 8500 + Math.floor(Math.random() * 2500),
            billing_month: billingDate,
            paid_date: paidDate,
            invoice_no: `INV-WTR-${yr}${monthStr}`,
            note: `ค่าน้ำประปาประจำเดือน ${monthStr}/${yr}`,
            created_by: adminUser.id
          });

          // Internet
          sampleExpenses.push({
            expense_category_id: catMap['INTERNET'],
            budget_category_id: bCatMap['INST_INCOME'],
            amount: 4500,
            billing_month: billingDate,
            paid_date: paidDate,
            invoice_no: `INV-NET-${yr}${monthStr}`,
            note: `ค่าอินเตอร์เน็ตความเร็วสูงประจำเดือน ${monthStr}/${yr}`,
            created_by: adminUser.id
          });

          // Phone
          sampleExpenses.push({
            expense_category_id: catMap['PHONE'],
            budget_category_id: bCatMap['INST_INCOME'],
            amount: 2200 + Math.floor(Math.random() * 800),
            billing_month: billingDate,
            paid_date: paidDate,
            invoice_no: `INV-TEL-${yr}${monthStr}`,
            note: `ค่าโทรศัพท์สำนักงานประจำเดือน ${monthStr}/${yr}`,
            created_by: adminUser.id
          });

          // Waste
          sampleExpenses.push({
            expense_category_id: catMap['WASTE'],
            budget_category_id: bCatMap['BUDGET_VOC'],
            amount: 1500,
            billing_month: billingDate,
            paid_date: paidDate,
            invoice_no: `INV-WST-${yr}${monthStr}`,
            note: `ค่ากำจัดขยะมูลฝอยประจำเดือน ${monthStr}/${yr}`,
            created_by: adminUser.id
          });
        }
      });

      await Expense.bulkCreate(sampleExpenses);
      console.log('✅ Sample expenses seeded for testing');
    }

  } catch (err) {
    console.error('❌ Error seeding initial data:', err);
  }
};

module.exports = seedInitialData;
