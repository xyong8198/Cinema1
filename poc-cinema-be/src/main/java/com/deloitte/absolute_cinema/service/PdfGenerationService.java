package com.deloitte.absolute_cinema.service;
 
import com.deloitte.absolute_cinema.entity.Booking;
import com.deloitte.absolute_cinema.entity.BookingSeat;
import com.deloitte.absolute_cinema.entity.Movie;
import com.deloitte.absolute_cinema.entity.Payment;
import com.deloitte.absolute_cinema.entity.PaymentMethod;
import com.deloitte.absolute_cinema.entity.Showtime;
import com.deloitte.absolute_cinema.repository.PaymentRepository;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import org.springframework.stereotype.Service;
 
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
 
@Service
public class PdfGenerationService {
 
    private final PaymentRepository paymentRepository;
 
    public PdfGenerationService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
 
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
 
    // Dark theme colors
    private static final DeviceRgb DARK_BG = new DeviceRgb(33, 37, 41); // #212529
    private static final DeviceRgb DARKER_BG = new DeviceRgb(52, 58, 64); // #343a40
    private static final DeviceRgb LIGHT_TEXT = new DeviceRgb(255, 255, 255); // White
    private static final DeviceRgb ACCENT_COLOR = new DeviceRgb(148, 87, 235); // #9457eb - purple
    private static final DeviceRgb SECONDARY_ACCENT = new DeviceRgb(214, 51, 132); // #d63384 - pink
    private static final DeviceRgb HIGHLIGHT_COLOR = new DeviceRgb(255, 193, 7); // #ffc107 - yellow
    private static final DeviceRgb MUTED_TEXT = new DeviceRgb(173, 181, 189); // #adb5bd - light gray
 
    private class BackgroundEventHandler implements IEventHandler {
        private DeviceRgb backgroundColor;
 
        public BackgroundEventHandler(DeviceRgb backgroundColor) {
            this.backgroundColor = backgroundColor;
        }
 
        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdf = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
 
            // Apply background color
            drawBackground(page, backgroundColor);
 
            // Apply gradient header
            drawGradientHeader(page);
        }
    }
 
    public byte[] generateETicket(Booking booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
 
            // Add the event handler to handle background for all new pages
            pdf.addEventHandler(PdfDocumentEvent.START_PAGE, new BackgroundEventHandler(DARK_BG));
 
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(50, 50, 50, 50);
 
 
            // Create a blank page
            pdf.addNewPage();
 
            // Apply background color to ALL pages - new code
            for (int i = 1; i <= pdf.getNumberOfPages(); i++) {
                PdfPage page = pdf.getPage(i);
                drawBackground(page, DARK_BG);
 
                // Add header with gradient to each page
                drawGradientHeader(page);
            }
 
            // Remaining code stays the same...
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
 
            // Add header with gradient
            drawGradientHeader(pdf.getFirstPage());
 
            // Header with logo and company name
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
            headerTable.setWidth(UnitValue.createPercentValue(100));
            headerTable.setMarginTop(30);
 
            Cell logoCell = new Cell();
            Paragraph logoPara = new Paragraph("ABSOLUTE CINEMA");
            logoPara.setFont(boldFont).setFontSize(24).setFontColor(LIGHT_TEXT);
            logoCell.add(logoPara);
            logoCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(logoCell);
 
            Cell headerTextCell = new Cell();
            headerTextCell.setTextAlignment(TextAlignment.RIGHT);
            headerTextCell.add(new Paragraph("E-TICKET").setFont(boldFont).setFontSize(18).setFontColor(LIGHT_TEXT));
            headerTextCell.add(new Paragraph("Booking ID: " + booking.getId()).setFont(regularFont).setFontSize(12).setFontColor(MUTED_TEXT));
            headerTextCell.add(new Paragraph("Date: " + booking.getCreatedAt().format(DATE_FORMATTER)).setFont(regularFont).setFontSize(12).setFontColor(MUTED_TEXT));
            headerTextCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(headerTextCell);
 
            document.add(headerTable);
            document.add(new Paragraph("\n"));
 
            // Add stylish divider
            addDivider(document, ACCENT_COLOR);
 
            // Get movie and showtime details from the first seat (all seats have the same showtime)
            if (!booking.getBookingSeats().isEmpty()) {
                BookingSeat firstSeat = booking.getBookingSeats().get(0);
                Showtime showtime = firstSeat.getSeat().getShowtime();
                Movie movie = showtime.getMovie();
 
                // Movie Details section header
                Paragraph sectionTitle = new Paragraph("MOVIE DETAILS")
                        .setFont(boldFont)
                        .setFontSize(14)
                        .setFontColor(ACCENT_COLOR)
                        .setMarginBottom(10);
                document.add(sectionTitle);
 
                // Movie Details Table with styled cells
                Table movieTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
                movieTable.setWidth(UnitValue.createPercentValue(100));
                movieTable.setBackgroundColor(DARKER_BG, 0.5f);
 
                // No borderRadius in your version, so we'll use a different approach
                movieTable.setBorder(Border.NO_BORDER);
 
                movieTable.addCell(createStyledLabelCell("Movie:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(movie.getTitle(), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Cinema:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(showtime.getCinema().getName(), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Screen:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell("Screen " + showtime.getHall(), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Date:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(showtime.getScreeningTime().format(DATE_FORMATTER), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Time:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(showtime.getScreeningTime().format(TIME_FORMATTER), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Seats:", boldFont, LIGHT_TEXT));
                List<String> seatNumbers = booking.getBookingSeats().stream()
                        .map(bs -> bs.getSeat().getSeatNumber())
                        .collect(Collectors.toList());
                movieTable.addCell(createStyledValueCell(String.join(", ", seatNumbers), regularFont, HIGHLIGHT_COLOR));
 
                document.add(movieTable);
                document.add(new Paragraph("\n"));
            }
 
            // Barcode/QR code with styled container
            Table barcodeTable = new Table(1);
            barcodeTable.setWidth(UnitValue.createPercentValue(100));
            barcodeTable.setMarginTop(20);
            barcodeTable.setMarginBottom(20);
 
            addQRCode(document, pdf, booking.getId());
 
            // Footer with instructions in a nice styled card
            document.add(new Paragraph("\n"));
            Table instructionsTable = new Table(1);
            instructionsTable.setWidth(UnitValue.createPercentValue(100));
            instructionsTable.setBackgroundColor(DARKER_BG, 0.5f);
            instructionsTable.setBorder(Border.NO_BORDER);
 
            Cell instructionsHeaderCell = new Cell();
            instructionsHeaderCell.add(new Paragraph("Instructions:")
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setFontColor(ACCENT_COLOR));
            instructionsHeaderCell.setBorder(Border.NO_BORDER);
            instructionsHeaderCell.setPadding(10);
            instructionsTable.addCell(instructionsHeaderCell);
 
            Cell instructionsContentCell = new Cell();
            instructionsContentCell.add(new Paragraph("1. Please arrive at least 15 minutes before the movie starts.")
                    .setFont(regularFont)
                    .setFontSize(10)
                    .setFontColor(LIGHT_TEXT));
            instructionsContentCell.add(new Paragraph("2. Present this e-ticket (printed or on your mobile device) at the entrance.")
                    .setFont(regularFont)
                    .setFontSize(10)
                    .setFontColor(LIGHT_TEXT));
            instructionsContentCell.add(new Paragraph("3. Outside food and drinks are not allowed in the cinema.")
                    .setFont(regularFont)
                    .setFontSize(10)
                    .setFontColor(LIGHT_TEXT));
            instructionsContentCell.setBorder(Border.NO_BORDER);
            instructionsContentCell.setPadding(10);
            instructionsTable.addCell(instructionsContentCell);
 
            document.add(instructionsTable);
 
            // Thank you message
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Thank you for choosing Absolute Cinema!")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(HIGHLIGHT_COLOR));
 
            // Add footer
            addFooter(document);
 
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating e-ticket", e);
        }
    }
 
    public byte[] generateReceipt(Booking booking) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
 
            // Add the event handler to handle background for all new pages
            pdf.addEventHandler(PdfDocumentEvent.START_PAGE, new BackgroundEventHandler(DARK_BG));
 
            Document document = new Document(pdf);
            document.setMargins(50, 50, 50, 50);
 
            // Create a blank page
            pdf.addNewPage();
 
 
            // Now we can safely access the first page
            PdfPage firstPage = pdf.getFirstPage();
 
            // Apply background color to ALL pages - new code
            for (int i = 1; i <= pdf.getNumberOfPages(); i++) {
                PdfPage page = pdf.getPage(i);
                drawBackground(page, DARK_BG);
 
                // Add header with gradient to each page
                drawGradientHeader(page);
            }
 
            // Set background color for dark theme
            drawBackground(firstPage, DARK_BG);
 
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
 
            // Add header with gradient
            drawGradientHeader(firstPage);
 
            // Header with company name and receipt title
            Table headerTable = new Table(1);
            headerTable.setWidth(UnitValue.createPercentValue(100));
            headerTable.setMarginTop(30);
 
            Cell logoCell = new Cell();
            logoCell.add(new Paragraph("ABSOLUTE CINEMA")
                    .setFont(boldFont)
                    .setFontSize(24)
                    .setFontColor(LIGHT_TEXT)
                    .setTextAlignment(TextAlignment.CENTER));
            logoCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(logoCell);
 
            Cell receiptTitleCell = new Cell();
            receiptTitleCell.add(new Paragraph("RECEIPT")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setFontColor(LIGHT_TEXT)
                    .setTextAlignment(TextAlignment.CENTER));
            receiptTitleCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(receiptTitleCell);
 
            document.add(headerTable);
            document.add(new Paragraph("\n"));
 
            // Add stylish divider
            addDivider(document, ACCENT_COLOR);
 
            // Receipt details in a styled card
            Table receiptTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
            receiptTable.setWidth(UnitValue.createPercentValue(100));
            receiptTable.setBackgroundColor(DARKER_BG, 0.5f);
            receiptTable.setBorder(Border.NO_BORDER);
 
            receiptTable.addCell(createStyledLabelCell("Receipt Number:", boldFont, LIGHT_TEXT));
            receiptTable.addCell(createStyledValueCell("REC-" + booking.getId(), regularFont, LIGHT_TEXT));
 
            receiptTable.addCell(createStyledLabelCell("Booking ID:", boldFont, LIGHT_TEXT));
            receiptTable.addCell(createStyledValueCell(booking.getId().toString(), regularFont, LIGHT_TEXT));
 
            receiptTable.addCell(createStyledLabelCell("Date:", boldFont, LIGHT_TEXT));
            receiptTable.addCell(createStyledValueCell(booking.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a")), regularFont, LIGHT_TEXT));
 
            // Customer info
            receiptTable.addCell(createStyledLabelCell("Customer:", boldFont, LIGHT_TEXT));
            String customerName = booking.getUser() != null ?
                    booking.getUser().getFullName():
                    booking.getGuest().getEmail();
            receiptTable.addCell(createStyledValueCell(customerName, regularFont, LIGHT_TEXT));
 
            document.add(receiptTable);
            document.add(new Paragraph("\n").setMarginBottom(10));
 
            // Get movie and showtime details
            if (!booking.getBookingSeats().isEmpty()) {
                BookingSeat firstSeat = booking.getBookingSeats().get(0);
                Showtime showtime = firstSeat.getSeat().getShowtime();
                Movie movie = showtime.getMovie();
 
                // Movie details section header
                Paragraph movieDetailsTitle = new Paragraph("Movie Details")
                        .setFont(boldFont)
                        .setFontSize(14)
                        .setFontColor(ACCENT_COLOR)
                        .setMarginBottom(10);
                document.add(movieDetailsTitle);
 
                // Movie details table with styling
                Table movieTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}));
                movieTable.setWidth(UnitValue.createPercentValue(100));
                movieTable.setBackgroundColor(DARKER_BG, 0.5f);
                movieTable.setBorder(Border.NO_BORDER);
 
                movieTable.addCell(createStyledLabelCell("Movie:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(movie.getTitle(), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Cinema:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(showtime.getCinema().getName(), regularFont, LIGHT_TEXT));
 
                movieTable.addCell(createStyledLabelCell("Date & Time:", boldFont, LIGHT_TEXT));
                movieTable.addCell(createStyledValueCell(
                        showtime.getScreeningTime().format(DATE_FORMATTER) + " at " +
                                showtime.getScreeningTime().format(TIME_FORMATTER), regularFont, LIGHT_TEXT));
 
                document.add(movieTable);
                document.add(new Paragraph("\n").setMarginBottom(10));
 
                // Item details section header
                Paragraph itemDetailsTitle = new Paragraph("Item Details")
                        .setFont(boldFont)
                        .setFontSize(14)
                        .setFontColor(ACCENT_COLOR)
                        .setMarginBottom(10);
                document.add(itemDetailsTitle);
 
                // Item details table with styling
                Table itemsTable = new Table(UnitValue.createPercentArray(new float[]{50, 20, 30}));
                itemsTable.setWidth(UnitValue.createPercentValue(100));
                itemsTable.setBackgroundColor(DARKER_BG, 0.5f);
 
                // Table header with accent color
                Cell descHeader = new Cell();
                descHeader.add(new Paragraph("Description").setFont(boldFont).setFontColor(LIGHT_TEXT));
                descHeader.setBorder(Border.NO_BORDER);
                descHeader.setBackgroundColor(ACCENT_COLOR, 0.7f);
                descHeader.setPadding(8);
 
                Cell qtyHeader = new Cell();
                qtyHeader.add(new Paragraph("Qty").setFont(boldFont).setFontColor(LIGHT_TEXT).setTextAlignment(TextAlignment.CENTER));
                qtyHeader.setBorder(Border.NO_BORDER);
                qtyHeader.setBackgroundColor(ACCENT_COLOR, 0.7f);
                qtyHeader.setPadding(8);
 
                Cell amountHeader = new Cell();
                amountHeader.add(new Paragraph("Amount").setFont(boldFont).setFontColor(LIGHT_TEXT).setTextAlignment(TextAlignment.RIGHT));
                amountHeader.setBorder(Border.NO_BORDER);
                amountHeader.setBackgroundColor(ACCENT_COLOR, 0.7f);
                amountHeader.setPadding(8);
 
                itemsTable.addHeaderCell(descHeader);
                itemsTable.addHeaderCell(qtyHeader);
                itemsTable.addHeaderCell(amountHeader);
 
                // Movie tickets row
                int ticketsQty = booking.getBookingSeats().size();
 
                Cell descCell = new Cell();
                descCell.add(new Paragraph("Movie Ticket - " + movie.getTitle()).setFont(regularFont).setFontColor(LIGHT_TEXT));
                descCell.setBorder(new SolidBorder(DARKER_BG, 0.5f));
                descCell.setPadding(8);
 
                Cell qtyCell = new Cell();
                qtyCell.add(new Paragraph(String.valueOf(ticketsQty)).setFont(regularFont).setFontColor(LIGHT_TEXT).setTextAlignment(TextAlignment.CENTER));
                qtyCell.setBorder(new SolidBorder(DARKER_BG, 0.5f));
                qtyCell.setPadding(8);
 
                // Calculate per ticket price
                double ticketPrice = booking.getTotalPrice().doubleValue() / ticketsQty;
 
                Cell amountCell = new Cell();
                amountCell.add(new Paragraph(String.format("$%.2f", ticketPrice * ticketsQty)).setFont(regularFont).setFontColor(LIGHT_TEXT).setTextAlignment(TextAlignment.RIGHT));
                amountCell.setBorder(new SolidBorder(DARKER_BG, 0.5f));
                amountCell.setPadding(8);
 
                itemsTable.addCell(descCell);
                itemsTable.addCell(qtyCell);
                itemsTable.addCell(amountCell);
 
                // Total row with highlight color
                Cell totalLabelCell = new Cell(1, 2);
                totalLabelCell.add(new Paragraph("Total").setFont(boldFont).setFontColor(LIGHT_TEXT).setTextAlignment(TextAlignment.RIGHT));
                totalLabelCell.setBorder(Border.NO_BORDER);
                totalLabelCell.setPadding(8);
 
                Cell totalAmountCell = new Cell();
                totalAmountCell.add(new Paragraph(String.format("$%.2f", booking.getTotalPrice().doubleValue())).setFont(boldFont).setFontColor(HIGHLIGHT_COLOR).setTextAlignment(TextAlignment.RIGHT));
                totalAmountCell.setBorder(Border.NO_BORDER);
                totalAmountCell.setPadding(8);
 
                itemsTable.addCell(totalLabelCell);
                itemsTable.addCell(totalAmountCell);
 
                document.add(itemsTable);
            }
 
            // Payment information section
            document.add(new Paragraph("\n").setMarginBottom(10));
            Paragraph paymentTitle = new Paragraph("Payment Information")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setFontColor(ACCENT_COLOR)
                    .setMarginBottom(10);
            document.add(paymentTitle);
 
            // Payment info table with styling
            Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}));
            paymentTable.setWidth(UnitValue.createPercentValue(100));
            paymentTable.setBackgroundColor(DARKER_BG, 0.5f);
            paymentTable.setBorder(Border.NO_BORDER);
 
            paymentTable.addCell(createStyledLabelCell("Payment Method:", boldFont, LIGHT_TEXT));
           
            String paymentMethodText = "Unknown";
            Optional<Payment> payment = paymentRepository.findByBookingId(booking.getId());
            if (payment.isPresent() && payment.get().getPaymentMethod() != null) {
                paymentMethodText = formatPaymentMethod(payment.get().getPaymentMethod());
            }
            paymentTable.addCell(createStyledValueCell(paymentMethodText, regularFont, LIGHT_TEXT));
 
            paymentTable.addCell(createStyledLabelCell("Payment Status:", boldFont, LIGHT_TEXT));
            paymentTable.addCell(createStyledValueCell("Paid", regularFont, HIGHLIGHT_COLOR));
 
            document.add(paymentTable);
 
            // Thank you message
            document.add(new Paragraph("\n").setMarginBottom(10));
            document.add(new Paragraph("Thank you for your purchase!")
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(HIGHLIGHT_COLOR));
 
            document.add(new Paragraph("This is an official receipt from Absolute Cinema.")
                    .setFont(regularFont)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(MUTED_TEXT));
 
            // Add footer
            addFooter(document);
 
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating receipt", e);
        }
    }
 
    // Helper methods for styled cells
    private Cell createStyledLabelCell(String text, PdfFont font, DeviceRgb textColor) {
        Cell cell = new Cell();
        cell.add(new Paragraph(text).setFont(font).setFontSize(11).setFontColor(textColor));
        cell.setBorder(Border.NO_BORDER);
        cell.setPadding(8);
        return cell;
    }
 
    private Cell createStyledValueCell(String text, PdfFont font, DeviceRgb textColor) {
        Cell cell = new Cell();
        cell.add(new Paragraph(text).setFont(font).setFontSize(11).setFontColor(textColor));
        cell.setBorder(Border.NO_BORDER);
        cell.setPadding(8);
        return cell;
    }
 
    private String formatPaymentMethod(PaymentMethod paymentMethod) {
        switch (paymentMethod) {
            case CREDIT_CARD:
                return "Credit Card";
            case DIGITAL_WALLET:
                return "Digital Wallet";
            default:
                return "Unknown";
        }
    }
 
    // Helper method to add styled divider
    private void addDivider(Document document, DeviceRgb color) {
        SolidLine line = new SolidLine(1f);
        line.setColor(color);
        LineSeparator separator = new LineSeparator(line);
        separator.setWidth(UnitValue.createPercentValue(100));
        separator.setMarginTop(10);
        separator.setMarginBottom(20);
        document.add(separator);
    }
 
    // Helper method to add footer
    private void addFooter(Document document) {
        document.add(new Paragraph("\n\n"));
 
        Table footerTable = new Table(1);
        footerTable.setWidth(UnitValue.createPercentValue(100));
 
        Cell footerCell = new Cell();
        footerCell.add(new Paragraph("© 2025 Absolute Cinema. All rights reserved.")
                .setFontSize(8)
                .setFontColor(MUTED_TEXT)
                .setTextAlignment(TextAlignment.CENTER));
        footerCell.setBorder(Border.NO_BORDER);
        footerTable.addCell(footerCell);
 
        document.add(footerTable);
    }
 
    // Method to draw the background
    private void drawBackground(PdfPage page, DeviceRgb color) {
        PdfCanvas canvas = new PdfCanvas(page);
        Rectangle rect = page.getPageSize();
        canvas.saveState()
                .setFillColor(color)
                .rectangle(rect.getLeft(), rect.getBottom(), rect.getWidth(), rect.getHeight())
                .fill()
                .restoreState();
    }
 
    // Method to draw gradient header
    private void drawGradientHeader(PdfPage page) {
        PdfCanvas canvas = new PdfCanvas(page);
        Rectangle rect = page.getPageSize();
 
        // Since we can't use PdfShading.simpleAxial, let's create a simplified gradient effect
        float height = 70f;
        float top = rect.getTop();
 
        // Draw gradient-like header (we'll fake it with multiple bands)
        int bands = 10;
        float bandHeight = height / bands;
 
        for (int i = 0; i < bands; i++) {
            // Calculate color for this band (interpolate between purple and pink)
            float ratio = (float) i / (bands - 1);
 
            int r = Math.round(111 + (214 - 111) * ratio);
            int g = Math.round(66 + (51 - 66) * ratio);
            int b = Math.round(193 + (132 - 193) * ratio);
 
            DeviceRgb bandColor = new DeviceRgb(r, g, b);
 
            canvas.saveState()
                    .setFillColor(bandColor)
                    .rectangle(0, top - (i + 1) * bandHeight, rect.getWidth(), bandHeight)
                    .fill()
                    .restoreState();
        }
    }
 
    // QR code with booking ID
    // QR code with booking ID - improved for better scannability and centering
    private void addQRCode(Document document, PdfDocument pdf, Long bookingId) throws IOException {
        // Create QR code with the booking ID - add prefix to make clear what the code contains
        String qrContent = "ABSOLUTE_CINEMA_BOOKING:" + bookingId;
 
        // Create QR code with higher error correction level for better scannability
        BarcodeQRCode qrCode = new BarcodeQRCode(qrContent);
 
        // Generate QR code image with better contrast (black on white)
        PdfFormXObject qrCodeObject = qrCode.createFormXObject(new DeviceRgb(0, 0, 0), pdf);
        Image qrCodeImage = new Image(qrCodeObject);
 
        // Make the QR code larger for better scanning
        qrCodeImage.setWidth(150);
        qrCodeImage.setHeight(150);
 
        // Add white background behind QR code to increase contrast and scannability
        Table qrContainer = new Table(1);
        qrContainer.setWidth(UnitValue.createPercentValue(100));
        qrContainer.setMarginTop(20);
        qrContainer.setMarginBottom(5);
        qrContainer.setHorizontalAlignment(HorizontalAlignment.CENTER);
 
        Cell backgroundCell = new Cell();
        backgroundCell.setBackgroundColor(new DeviceRgb(255, 255, 255)); // White background
        backgroundCell.setWidth(UnitValue.createPercentValue(100));
        backgroundCell.setPadding(15); // Padding around QR code
        backgroundCell.setBorder(new SolidBorder(LIGHT_TEXT, 1)); // Light border around the white area
        backgroundCell.setHorizontalAlignment(HorizontalAlignment.CENTER);
 
        // Add QR code to the white background cell and center it
        qrCodeImage.setHorizontalAlignment(HorizontalAlignment.CENTER);
        backgroundCell.add(qrCodeImage);
        qrContainer.addCell(backgroundCell);
 
        // Add QR code label
        Cell labelCell = new Cell();
        labelCell.add(new Paragraph("Scan for booking #" + bookingId)
                .setFont(PdfFontFactory.createFont(StandardFonts.HELVETICA))
                .setFontSize(10)
                .setFontColor(MUTED_TEXT)
                .setTextAlignment(TextAlignment.CENTER));
        labelCell.setBorder(Border.NO_BORDER);
        labelCell.setHorizontalAlignment(HorizontalAlignment.CENTER);
        qrContainer.addCell(labelCell);
 
        document.add(qrContainer);
    }
}
 
