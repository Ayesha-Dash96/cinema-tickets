import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import SeatReservationService from '../mocks/eatReservationService';
import TicketPaymentService from '../mocks/TicketPaymentService';

jest.mock('../thirdparty/seatbooking/SeatReservationService', () => {
  return jest.fn().mockImplementation(() => new SeatReservationService());
});

jest.mock('../thirdparty/paymentgateway/TicketPaymentService', () => {
  return jest.fn().mockImplementation(() => new TicketPaymentService());
});


describe('TicketService', () => {
    let ticketService;
  
    beforeEach(() => {
      ticketService = new TicketService();
    });
  
    test('should throw an error if account ID is invalid', () => {
      assert.throws(() => {
        ticketService.purchaseTickets(-1, new TicketTypeRequest('ADULT', 1));
      }, InvalidPurchaseException);
    });
  
    test('should throw an error if no adult tickets are purchased', () => {
      assert.throws(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 1));
      }, InvalidPurchaseException);
    });
  
    test('should throw an error if total tickets exceed limit', () => {
      const ticketRequests = Array.from({ length: 26 }, () => new TicketTypeRequest('ADULT', 1));
      assert.throws(() => {
        ticketService.purchaseTickets(1, ...ticketRequests);
      }, InvalidPurchaseException);
    });
  
    test('should call makePayment and reserveSeat on valid purchase', () => {
      const mockPaymentService = new TicketPaymentService();
      const mockReservationService = new SeatReservationService();
  
      ticketService.ticketPaymentService = mockPaymentService;
      ticketService.seatReservationService = mockReservationService;
  
      ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('CHILD', 2));
  
      assert(mockPaymentService.makePayment.calledWith(1, 80));
      assert(mockReservationService.reserveSeat.calledWith(1, 4));
    });
  
    test('should handle unexpected error gracefully', () => {
      ticketService.ticketPaymentService = {
        makePayment: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };
  
      ticketService.seatReservationService = new MockSeatReservationService();
  
      const response = ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 1));
      assert.strictEqual(response, 'Unexpected error encountered : Unexpected error');
    });
  });