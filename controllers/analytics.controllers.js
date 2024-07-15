const Invoice = require("../models/Invoice");
const { Quran } = require("../models/Quran");
const { Book } = require("../models/Book");
const { DueAction } = require("../models/DueAction");
const { RefundAction } = require("../models/RefundAction");

const getTotals = async (startOfDay, endOfDay) => {
  return await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$paid" },
        totalProfit: { $sum: "$profit" },
      },
    },
  ]);
};

const getRefundsPaid = async (startOfDay, endOfDay) => {
  return await RefundAction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        invoiceIssuedAt: {
          $not: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRefundsPaid: { $sum: "$amount" },
      },
    },
  ]);
};

const getDuesPaid = async (startOfDay, endOfDay) => {
  return await DueAction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
};

const getBookStock = async () => {
  return await Book.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$stock" },
      },
    },
  ]);
};

const getQuranStock = async () => {
  return await Quran.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$stock" },
      },
    },
  ]);
};

const getBookSellings = async () => {
  return await Book.aggregate([
    {
      $group: {
        _id: null,
        totalSellings: { $sum: "$sold" },
      },
    },
  ]);
};

const getQuranSellings = async () => {
  return await Quran.aggregate([
    {
      $group: {
        _id: null,
        totalSellings: { $sum: "$sold" },
      },
    },
  ]);
};

const getMonthlyProfits = async () => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

  return await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalProfit: { $sum: "$profit" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);
};

// Function to get daily profits for the current week
const getWeeklyProfits = async () => {
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfWeek,
          $lte: endOfWeek,
        },
      },
    },
    {
      $group: {
        _id: { day: { $dayOfWeek: "$createdAt" } },
        totalProfit: { $sum: "$profit" },
      },
    },
    {
      $sort: { "_id.day": 1 },
    },
  ]);
};

// Function to calculate percentage difference
const getPercentageDifference = (todayValue, yesterdayValue) => {
  if (yesterdayValue === 0) {
    return todayValue === 0 ? 0 : 100;
  }
  return ((todayValue - yesterdayValue) / yesterdayValue) * 100;
};

const GetAnalyticsController = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    const todayResult = await getTotals(startOfToday, endOfToday);
    const duesPaidToday = await getDuesPaid(startOfToday, endOfToday);
    if (duesPaidToday.length > 0) {
      todayResult[0].totalAmount += duesPaidToday[0].totalAmount;
    }

    const yesterdayResult = await getTotals(startOfYesterday, endOfYesterday);
    const duesPaidYesterday = await getDuesPaid(
      startOfYesterday,
      endOfYesterday
    );
    if (duesPaidYesterday.length > 0) {
      yesterdayResult[0].totalAmount += duesPaidYesterday[0].totalAmount;
    }
    let todayTotalAmount =
      todayResult.length > 0 ? todayResult[0].totalAmount : 0;
    const todayTotalProfit =
      todayResult.length > 0 ? todayResult[0].totalProfit : 0;

    const yesterdayTotalAmount =
      yesterdayResult.length > 0 ? yesterdayResult[0].totalAmount : 0;
    const yesterdayTotalProfit =
      yesterdayResult.length > 0 ? yesterdayResult[0].totalProfit : 0;

    const amountPercentageDifference = getPercentageDifference(
      todayTotalAmount,
      yesterdayTotalAmount
    );
    const profitPercentageDifference = getPercentageDifference(
      todayTotalProfit,
      yesterdayTotalProfit
    );
    const refunds = await getRefundsPaid(startOfToday, endOfToday);
    if (refunds.length !== 0) {
      todayTotalAmount -= refunds[0].totalRefundsPaid;
    }
    const bookStock = await getBookStock();
    const quranStock = await getQuranStock();

    const monthlyProfitsResult = await getMonthlyProfits();
    const monthlyProfits = Array(12).fill(0);
    monthlyProfitsResult.forEach((monthData) => {
      monthlyProfits[monthData._id.month - 1] = monthData.totalProfit;
    });

    const weeklyProfitsResult = await getWeeklyProfits();
    const weeklyProfits = Array(7).fill(0);
    weeklyProfitsResult.forEach((dayData) => {
      weeklyProfits[dayData._id.day - 1] = dayData.totalProfit;
    });

    const bookSellings = await getBookSellings();
    const quranSellings = await getQuranSellings();

    return res.status(200).json({
      todayTotalAmount,
      todayTotalProfit,
      yesterdayTotalAmount,
      yesterdayTotalProfit,
      amountPercentageDifference: amountPercentageDifference.toFixed(2),
      profitPercentageDifference: profitPercentageDifference.toFixed(2),
      bookStock,
      quranStock,
      monthlyProfits,
      weeklyProfits,
      bookSellings,
      quranSellings,
    });
  } catch (err) {
    console.error("Error getting analytics:", err);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
};

module.exports = { GetAnalyticsController };
