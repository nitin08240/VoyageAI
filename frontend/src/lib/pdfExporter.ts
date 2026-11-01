import jsPDF from 'jspdf';
import { IItinerary, IItineraryDay, IActivity, IHotel, IRestaurant } from '@/types/itinerary.types';
import { ITrip } from '@/types/trip.types';
import { formatCurrency, formatPriceRange, getCurrencySymbol } from './currency';

/**
 * Professional multi-page PDF document generator for VoyageAI travel blueprints.
 */
export async function generateItineraryPDF(trip: ITrip, itinerary: IItinerary): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const currency = trip.budget?.currency || itinerary.budgetBreakdown?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const destName = trip.destination?.city || trip.destination?.name || itinerary.destination || 'Voyage';
  const destCountry = trip.destination?.country || '';

  let currentY = margin;

  // Helpers
  const addHeader = (title: string, subtitle?: string) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 26, pageWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('VOYAGEAI', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('AI-POWERED SMART TRAVEL BLUEPRINT', margin, 18);

    if (title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), pageWidth - margin, 14, { align: 'right' });
    }
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(249, 115, 22);
      doc.text(subtitle, pageWidth - margin, 19, { align: 'right' });
    }

    currentY = 38;
  };

  const addFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`VoyageAI Personalized Itinerary • ${destName}, ${destCountry}`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  const ensureSpace = (neededHeight: number, pageTitle = destName) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      addHeader(pageTitle, 'TRAVEL ITINERARY');
      return true;
    }
    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ─────────────────────────────────────────────────────────────
  addHeader(destName, 'EXECUTIVE SUMMARY');

  // Hero Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(destName, margin + 8, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`${destCountry} • ${itinerary.days?.length || trip.dates?.duration || 1} Days Curated Journey`, margin + 8, currentY + 24);

  // Key stats bar
  const totalBudgetAmt = trip.budget?.amount ?? trip.budget?.total ?? itinerary.budgetBreakdown?.total ?? 0;
  const adults = trip.travellers?.adults || 1;
  const children = trip.travellers?.children || 0;
  const dateStr = trip.dates?.departureDate 
    ? `${trip.dates.departureDate} to ${trip.dates.returnDate || ''}`
    : 'Upcoming Travel';

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('DATES:', margin + 8, currentY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, margin + 28, currentY + 36);

  doc.setFont('helvetica', 'bold');
  doc.text('TRAVELERS:', margin + 8, currentY + 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`${adults} Adults${children > 0 ? `, ${children} Children` : ''} (${trip.travellers?.type || 'Leisure'})`, margin + 35, currentY + 44);

  doc.setFont('helvetica', 'bold');
  doc.text('BUDGET:', margin + 105, currentY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`${currencySymbol} ${totalBudgetAmt.toLocaleString()} (${currency})`, margin + 125, currentY + 36);

  doc.setFont('helvetica', 'bold');
  doc.text('STYLE:', margin + 105, currentY + 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`${trip.preferences?.accommodation || 'Comfort'} • ${trip.preferences?.food?.diet || 'Authentic'}`, margin + 125, currentY + 44);

  currentY += 62;

  // Destination Overview Paragraph
  let overviewText = '';
  if (typeof itinerary.overview === 'string') {
    try {
      if (itinerary.overview.startsWith('{')) {
        const parsed = JSON.parse(itinerary.overview);
        overviewText = parsed.destinationIntroduction || parsed.overview || itinerary.overview;
      } else {
        overviewText = itinerary.overview;
      }
    } catch {
      overviewText = itinerary.overview;
    }
  }

  if (overviewText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Destination Briefing & Experience Architecture', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
    doc.text(splitOverview.slice(0, 7), margin, currentY);
    currentY += Math.min(splitOverview.length, 7) * 4.5 + 6;
  }

  // Budget Breakdown Table
  if (itinerary.budgetBreakdown) {
    ensureSpace(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Financial Blueprint & Resource Allocation', margin, currentY);
    currentY += 6;

    const b = itinerary.budgetBreakdown;
    const items = [
      { cat: 'Accommodation & Lodging', val: b.accommodation || 0 },
      { cat: 'Food & Culinary Experiences', val: b.food || 0 },
      { cat: 'Transit, Taxis & Local Transfers', val: (b as any).transportation ?? b.transport ?? 0 },
      { cat: 'Attraction Tickets & Activities', val: b.activities || 0 },
      { cat: 'Contingency & Incidentals', val: (b as any).emergencyReserve ?? b.miscellaneous ?? 0 },
    ];

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('EXPENSE CATEGORY', margin + 4, currentY + 5);
    doc.text('ALLOCATION', pageWidth - margin - 40, currentY + 5);
    doc.text('SHARE', pageWidth - margin - 12, currentY + 5, { align: 'right' });
    currentY += 8;

    items.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY - 1, contentWidth, 6, 'F');
      }
      const pct = b.total > 0 ? Math.round((item.val / b.total) * 100) : 0;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(item.cat, margin + 4, currentY + 3.5);
      doc.text(formatCurrency(item.val, currency), pageWidth - margin - 40, currentY + 3.5);
      doc.text(`${pct}%`, pageWidth - margin - 12, currentY + 3.5, { align: 'right' });
      currentY += 6;
    });

    // Total line
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL ESTIMATED OUTLAY', margin + 4, currentY + 5);
    doc.text(formatCurrency(b.total, currency), pageWidth - margin - 40, currentY + 5);
    doc.text('100%', pageWidth - margin - 12, currentY + 5, { align: 'right' });
    currentY += 12;
  }

  // ─────────────────────────────────────────────────────────────
  // DAY-BY-DAY ITINERARY PAGES
  // ─────────────────────────────────────────────────────────────
  itinerary.days?.forEach((day: IItineraryDay, index: number) => {
    doc.addPage();
    addHeader(`${destName} — DAY ${day.day || index + 1}`, day.date || `Day ${day.day || index + 1}`);

    // Day banner
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text(`DAY ${day.day || index + 1}: ${day.theme || day.title || 'Exploration & Highlights'}`, margin + 6, currentY + 7);

    // Weather pill if present
    if (day.weather && day.weather.temperature !== undefined) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(`Forecast: ${day.weather.temperature}°C, ${day.weather.condition || 'Clear'}`, margin + 6, currentY + 12.5);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(`Date: ${day.date || 'Day Schedule'}`, margin + 6, currentY + 12.5);
    }
    currentY += 22;

    // Day Advice / Practical Note
    if (day.practicalAdvice || day.notes) {
      const advice = day.practicalAdvice || day.notes || '';
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('LOCAL ADVICE:', margin + 4, currentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const splitAdv = doc.splitTextToSize(advice, contentWidth - 32);
      doc.text(splitAdv[0] || '', margin + 28, currentY + 5);
      if (splitAdv[1]) doc.text(splitAdv[1], margin + 28, currentY + 9);
      currentY += 16;
    }

    // Combine day activities
    const activities: IActivity[] = [
      ...(day.activities || []),
      ...(day.morning || []),
      ...(day.afternoon || []),
      ...(day.evening || []),
    ];

    if (activities.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Scheduled Experiences & Transit Schedule', margin, currentY);
      currentY += 5;

      activities.forEach((act, actIdx) => {
        ensureSpace(32, `DAY ${day.day || index + 1}`);

        // Activity card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

        // Left accent bar
        doc.setFillColor(249, 115, 22);
        doc.rect(margin, currentY, 2.5, 26, 'F');

        // Timing & Cost Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(249, 115, 22);
        const timeSlot = act.time || act.timeOfDay || `Stop ${actIdx + 1}`;
        doc.text(timeSlot.toUpperCase(), margin + 6, currentY + 6);

        // Activity Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(act.name.slice(0, 52), margin + 6, currentY + 11.5);

        // Cost & Duration right-aligned
        const costStr = formatCurrency(act.cost ?? act.estimatedCost, act.currency || currency);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text(costStr, pageWidth - margin - 6, currentY + 6, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(act.duration || '1.5 hrs', pageWidth - margin - 6, currentY + 11.5, { align: 'right' });

        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const splitDesc = doc.splitTextToSize(act.description, contentWidth - 14);
        doc.text(splitDesc.slice(0, 2), margin + 6, currentY + 17);

        // Transit note
        if (act.transportation || act.transportToNext) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Transit: ${act.transportation || act.transportToNext}`, margin + 6, currentY + 23.5);
        }

        currentY += 29;
      });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // PAGE: CURATED ACCOMMODATIONS & DINING
  // ─────────────────────────────────────────────────────────────
  doc.addPage();
  addHeader(destName, 'STAYS & DINING GUIDE');

  // Stays Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Curated Accommodations', margin, currentY);
  currentY += 6;

  if (itinerary.hotels && itinerary.hotels.length > 0) {
    itinerary.hotels.forEach((hotel: IHotel) => {
      ensureSpace(34, 'STAYS & DINING GUIDE');

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(hotel.name, margin + 6, currentY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(249, 115, 22);
      const displayPrice = formatPriceRange(hotel.priceRange, currency) || `${currencySymbol}3,500 - ${currencySymbol}6,000 / night`;
      doc.text(displayPrice, pageWidth - margin - 6, currentY + 7, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${hotel.category?.toUpperCase() || 'HOTEL'} • ${hotel.location}`, margin + 6, currentY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitWhy = doc.splitTextToSize(hotel.whyRecommended || 'Vetted for strategic location and reliable amenities.', contentWidth - 14);
      doc.text(splitWhy.slice(0, 2), margin + 6, currentY + 18);

      if (hotel.facilities && hotel.facilities.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Amenities: ${hotel.facilities.slice(0, 5).join(' • ')}`, margin + 6, currentY + 25);
      }

      currentY += 32;
    });
  }

  // Dining Section
  ensureSpace(40, 'STAYS & DINING GUIDE');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Recommended Dining & Culinary Hotspots', margin, currentY);
  currentY += 6;

  if (itinerary.restaurants && itinerary.restaurants.length > 0) {
    itinerary.restaurants.forEach((restaurant: IRestaurant) => {
      ensureSpace(28, 'STAYS & DINING GUIDE');

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(restaurant.name, margin + 6, currentY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(249, 115, 22);
      doc.text(restaurant.cuisine || 'Local Cuisine', pageWidth - margin - 6, currentY + 6.5, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Location: ${restaurant.location}`, margin + 6, currentY + 11.5);

      if (restaurant.mustTry) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`Must Try: `, margin + 6, currentY + 16.5);
        doc.setFont('helvetica', 'normal');
        doc.text(restaurant.mustTry.slice(0, 75), margin + 22, currentY + 16.5);
      }

      currentY += 26;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // PAGE: SAFETY & PACKING CHECKLIST
  // ─────────────────────────────────────────────────────────────
  doc.addPage();
  addHeader(destName, 'SAFETY & PREPARATION');

  // Safety Tips
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Essential Safety & Travel Precautions', margin, currentY);
  currentY += 6;

  const safetyList = (itinerary.safetyTips || [
    'Keep copies of passports and emergency contact numbers in secure cloud storage.',
    'Use registered prepaid taxis or licensed local transport instead of unsolicited street offers.',
    'Maintain adequate cash buffer for high-altitude passes and remote vendor kiosks.',
    'Check local weather advisories each morning before departure for mountain passes.',
  ]).slice(0, 6);

  safetyList.forEach((tip: any) => {
    const tipText = typeof tip === 'string' ? tip : tip.category || 'Travel precaution';
    doc.setFillColor(249, 115, 22);
    doc.circle(margin + 2, currentY + 2, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitTip = doc.splitTextToSize(tipText, contentWidth - 10);
    doc.text(splitTip, margin + 6, currentY + 3);
    currentY += splitTip.length * 4.5 + 2;
  });

  currentY += 8;

  // Things to avoid
  if (itinerary.thingsToAvoid && itinerary.thingsToAvoid.length > 0) {
    ensureSpace(40, 'SAFETY & PREPARATION');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('Pitfalls & Tourist Scams to Avoid', margin, currentY);
    currentY += 6;

    itinerary.thingsToAvoid.slice(0, 4).forEach((avoid: string) => {
      doc.setFillColor(220, 38, 38);
      doc.circle(margin + 2, currentY + 2, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const splitAvoid = doc.splitTextToSize(avoid, contentWidth - 10);
      doc.text(splitAvoid, margin + 6, currentY + 3);
      currentY += splitAvoid.length * 4.5 + 2;
    });

    currentY += 8;
  }

  // Packing Checklist
  ensureSpace(40, 'SAFETY & PREPARATION');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Curated Packing Checklist', margin, currentY);
  currentY += 6;

  // Extract checklist items
  let packingCats: { name: string; items: string[] }[] = [];
  if (Array.isArray(itinerary.packingChecklist)) {
    packingCats = (itinerary.packingChecklist as any[]).map((c: any) => ({
      name: c.category || c.name || 'Essentials',
      items: Array.isArray(c.items) ? c.items.map((it: any) => (typeof it === 'string' ? it : it.item)) : [],
    }));
  } else if (Array.isArray((itinerary.packingChecklist as any)?.categories)) {
    packingCats = (itinerary.packingChecklist as any).categories.map((c: any) => ({
      name: c.name || 'Essentials',
      items: Array.isArray(c.items) ? c.items.map((it: any) => (typeof it === 'string' ? it : it.item)) : [],
    }));
  } else if (typeof itinerary.packingChecklist === 'object' && itinerary.packingChecklist !== null) {
    packingCats = Object.entries(itinerary.packingChecklist).map(([name, items]) => ({
      name,
      items: Array.isArray(items) ? (items as any[]).map((it) => (typeof it === 'string' ? it : it.item)) : [],
    }));
  }

  if (packingCats.length > 0) {
    packingCats.slice(0, 4).forEach((cat) => {
      ensureSpace(24, 'SAFETY & PREPARATION');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(249, 115, 22);
      doc.text(cat.name.toUpperCase(), margin, currentY);
      currentY += 5;

      const itemsStr = cat.items.slice(0, 8).join('  •  ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitItems = doc.splitTextToSize(itemsStr, contentWidth);
      doc.text(splitItems, margin, currentY);
      currentY += splitItems.length * 4.5 + 4;
    });
  }

  // Stamp Footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  // Save PDF
  doc.save(`VoyageAI-Blueprint-${destName.replace(/\s+/g, '_')}.pdf`);
}

