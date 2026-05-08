import { Order, Feedback } from '../types';
import { subDays, format, startOfDay } from 'date-fns';

const createMockOrders = (): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['Pending', 'Preparing', 'Completed', 'Cancelled'];
  const payments: Order['paymentMethod'][] = ['Cash', 'Card', 'Online'];
  const items = ['Margherita Pizza', 'Double Burger', 'Caesar Salad', 'Pasta Carbonara', 'Sushi Platter', 'Club Sandwich'];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = subDays(new Date(), daysAgo).toISOString();
    orders.push({
      id: `ord-${i}`,
      customerName: `Customer ${i + 1}`,
      phoneNumber: `+1 555-010${i}`,
      date,
      items: items[Math.floor(Math.random() * items.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
      totalAmount: Math.floor(Math.random() * 100) + 20,
      paymentMethod: payments[Math.floor(Math.random() * payments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const createMockFeedback = (): Feedback[] => {
  const feedback: Feedback[] = [];
  const messages = [
    "Amazing food and service!",
    "The delivery was a bit slow, but the food was great.",
    "Best pizza in town!",
    "The staff was very friendly.",
    "Loved the atmosphere and the dessert.",
    "A bit overpriced for the portion size.",
    "Excellent experience overall.",
  ];

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = subDays(new Date(), daysAgo).toISOString();
    feedback.push({
      id: `fb-${i}`,
      customerName: `Reviewer ${i + 1}`,
      phoneNumber: `+1 555-020${i}`,
      message: messages[Math.floor(Math.random() * messages.length)],
      rating: Math.floor(Math.random() * 3) + 3, // Rating 3-5
      date,
    });
  }
  return feedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const INITIAL_ORDERS = createMockOrders();
export const INITIAL_FEEDBACK = createMockFeedback();

export const calculateDashboardStats = (orders: Order[], feedback: Feedback[]) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalFeedback = feedback.length;

  // Process data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return format(d, 'MMM dd');
  }).reverse();

  const revenueByDay = last7Days.map(dayStr => {
    const dayOrders = orders.filter(o => format(new Date(o.date), 'MMM dd') === dayStr);
    return {
      name: dayStr,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      count: dayOrders.length
    };
  });

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalFeedback,
    revenueByDay
  };
};
