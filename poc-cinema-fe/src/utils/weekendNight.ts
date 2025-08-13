export const isWeekendNight = (screeningTime: string): boolean => {
  const date = new Date(screeningTime);
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  
  const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  const isAfter6PM = hour >= 18;
  
  return isWeekendDay && isAfter6PM;
};

export const calculateTicketPrice = (basePrice: number, screeningTime: string): number => {
  if (isWeekendNight(screeningTime)) {
    return basePrice * 1.25;
  }
  return basePrice;
};

export const formatPricingDisplay = (
  basePrice: number, 
  quantity: number, 
  screeningTime: string
): { 
  display: string; 
  isWeekendNight: boolean; 
  finalPrice: number 
} => {
  const isWeekend = isWeekendNight(screeningTime);
  const ticketPrice = calculateTicketPrice(basePrice, screeningTime);
  const finalPrice = ticketPrice * quantity;
  
  if (isWeekend) {
    return {
      display: `${quantity} × RM${basePrice.toFixed(2)} × 125%`,
      isWeekendNight: true,
      finalPrice
    };
  } else {
    return {
      display: `${quantity} × RM${basePrice.toFixed(2)}`,
      isWeekendNight: false,
      finalPrice
    };
  }
};
