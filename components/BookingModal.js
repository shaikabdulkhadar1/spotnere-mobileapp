import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";

const { width, height } = Dimensions.get("window");

const BookingModal = ({ visible, onClose, placeDetails, vendor }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [guests, setGuests] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Available time slots
  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isDateSelected = (date) => {
    return date && selectedDate && date.getTime() === selectedDate.getTime();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDatePress = (date) => {
    if (!date || isPastDate(date)) return;
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
    setGuests(""); // Reset guests when date changes
  };

  const handleTimeSlotPress = (timeSlot) => {
    if (!selectedDate) return; // Don't allow selection if no date is selected
    setSelectedTimeSlot(timeSlot);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  const calculateTotal = () => {
    if (!placeDetails || !selectedDate || !selectedTimeSlot || !guests) {
      return { subtotal: 0, serviceFee: 0, total: 0 };
    }

    const basePrice =
      placeDetails.price_per_night ||
      placeDetails.avg_price ||
      placeDetails.price ||
      0;

    // Parse number of guests
    const numGuests = parseInt(guests, 10) || 1;

    // Since we only have single date selection, assume 1 night
    const nights = 1;
    const subtotal = parseFloat(basePrice) * nights * numGuests;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total };
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bookingTotal = calculateTotal();

  const handlePayAndBook = () => {
    if (!selectedDate || !selectedTimeSlot || !guests) {
      Alert.alert(
        "Incomplete Booking",
        "Please select date, time slot, and number of guests.",
        [{ text: "OK" }]
      );
      return;
    }

    const total = bookingTotal.total;
    if (total <= 0) {
      Alert.alert("Invalid Amount", "Please check your booking details.", [
        { text: "OK" },
      ]);
      return;
    }

    const upiId = vendor?.upi_id?.trim();
    if (!upiId) {
      Alert.alert(
        "Payment Unavailable",
        "This venue has not set up UPI payments yet. Please contact the venue directly.",
        [{ text: "OK" }]
      );
      return;
    }

    const payeeName =
      vendor?.business_name || placeDetails?.name || "Venue Owner";
    const amount = total.toFixed(2);

    const buildUpiUrl = (scheme) => {
      const params = new URLSearchParams({
        pa: upiId,
        pn: payeeName,
        am: amount,
        cu: "INR",
        tn: `Booking - ${placeDetails?.name || placeDetails?.title || "Place"}`,
      });
      return `${scheme}://pay?${params.toString()}`;
    };

    const openPaymentApp = async (scheme) => {
      const url = buildUpiUrl(scheme);
      const genericUpiUrl = buildUpiUrl("upi");
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn(`Could not open ${scheme}:`, err);
        try {
          await Linking.openURL(genericUpiUrl);
        } catch (fallbackErr) {
          Alert.alert(
            "Payment Failed",
            "Could not open payment app. Please ensure PhonePe or Google Pay is installed.",
            [{ text: "OK" }]
          );
        }
      }
    };

    Alert.alert("Choose Payment App", "Pay via PhonePe or Google Pay", [
      {
        text: "PhonePe",
        onPress: () => openPaymentApp("phonepe"),
      },
      {
        text: "Google Pay",
        onPress: () => openPaymentApp("gpay"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const BlurContainer = Platform.OS === "ios" ? BlurView : View;
  const blurProps =
    Platform.OS === "ios"
      ? { intensity: 80 }
      : { backgroundColor: "rgba(0, 0, 0, 0.5)" };

  return (
    <Modal
      visible={!!visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurContainer {...blurProps} style={styles.blurOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Book your stay</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Calendar */}
              <View style={styles.calendarContainer}>
                {/* Month Navigation */}
                <View style={styles.monthHeader}>
                  <TouchableOpacity
                    onPress={() => navigateMonth(-1)}
                    style={styles.monthNavButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>
                    {formatMonthYear(currentMonth)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigateMonth(1)}
                    style={styles.monthNavButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>

                {/* Week Days Header */}
                <View style={styles.weekDaysContainer}>
                  {weekDays.map((day, index) => (
                    <View key={index} style={styles.weekDay}>
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {days.map((date, index) => {
                    if (!date) {
                      return <View key={index} style={styles.dayCell} />;
                    }

                    const isSelected = isDateSelected(date);
                    const isPast = isPastDate(date);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isPast && styles.dayCellPast,
                        ]}
                        onPress={() => handleDatePress(date)}
                        disabled={isPast}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            isPast && styles.dayTextPast,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Time Slot Selection - Always visible but grayed out until date is selected */}
              <View style={styles.timeSlotContainer}>
                <Text
                  style={[
                    styles.timeSlotTitle,
                    !selectedDate && styles.timeSlotTitleDisabled,
                  ]}
                >
                  Select time
                </Text>
                <View style={styles.timeSlotGrid}>
                  {timeSlots.map((timeSlot, index) => {
                    const isSelected = selectedTimeSlot === timeSlot;
                    const isDisabled = !selectedDate;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlotButton,
                          isSelected && styles.timeSlotButtonSelected,
                          !isDisabled &&
                            !isSelected &&
                            styles.timeSlotButtonEnabled,
                          isDisabled && styles.timeSlotButtonDisabled,
                        ]}
                        onPress={() => handleTimeSlotPress(timeSlot)}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            isSelected && styles.timeSlotTextSelected,
                            !isDisabled &&
                              !isSelected &&
                              styles.timeSlotTextEnabled,
                            isDisabled && styles.timeSlotTextDisabled,
                          ]}
                        >
                          {timeSlot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Guests Input Field */}
              <View style={styles.guestsContainer}>
                <Text
                  style={[
                    styles.guestsTitle,
                    (!selectedDate || !selectedTimeSlot) &&
                      styles.guestsTitleDisabled,
                  ]}
                >
                  Number of guests
                </Text>
                <View
                  style={[
                    styles.guestsInputContainer,
                    (!selectedDate || !selectedTimeSlot) &&
                      styles.guestsInputContainerDisabled,
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.guestsIcon}
                  />
                  <TextInput
                    style={[
                      styles.guestsInput,
                      (!selectedDate || !selectedTimeSlot) &&
                        styles.guestsInputDisabled,
                    ]}
                    placeholder="Enter number of guests"
                    placeholderTextColor={colors.textSecondary}
                    value={guests}
                    onChangeText={setGuests}
                    keyboardType="numeric"
                    editable={!!(selectedDate && selectedTimeSlot)}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Pay and Book Button */}
            <View style={styles.footer}>
              {/* Breakdown Toggle */}
              <TouchableOpacity
                style={styles.breakdownToggle}
                onPress={() => setShowBreakdown(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.breakdownToggleText}>Price breakdown</Text>
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayAndBook}
                activeOpacity={0.8}
              >
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>Pay and Book</Text>
                  <Text style={styles.payButtonAmount}>
                    ${bookingTotal.total.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </BlurContainer>
      </View>

      {/* Breakdown Modal */}
      <Modal
        visible={showBreakdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBreakdown(false)}
      >
        <View style={styles.breakdownModalOverlay}>
          <BlurContainer {...blurProps} style={styles.breakdownBlurOverlay}>
            <TouchableOpacity
              style={styles.breakdownModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowBreakdown(false)}
            >
              <View style={styles.breakdownModalContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.breakdownModalContent}>
                    {/* Header */}
                    <View style={styles.breakdownHeader}>
                      <Text style={styles.breakdownHeaderTitle}>
                        Price breakdown
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowBreakdown(false)}
                        style={styles.breakdownCloseButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {/* Breakdown Details */}
                    <View style={styles.breakdownDetails}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>
                          $
                          {placeDetails?.price_per_night ||
                            placeDetails?.avg_price ||
                            placeDetails?.price ||
                            0}{" "}
                          × {parseInt(guests, 10) || 1} guest
                          {parseInt(guests, 10) !== 1 ? "s" : ""}
                        </Text>
                        <Text style={styles.breakdownValue}>
                          ${bookingTotal.subtotal.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Service fee</Text>
                        <Text style={styles.breakdownValue}>
                          ${bookingTotal.serviceFee.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={[styles.breakdownRow, styles.breakdownTotalRow]}
                      >
                        <Text style={styles.breakdownTotalLabel}>Total</Text>
                        <Text style={styles.breakdownTotalValue}>
                          ${bookingTotal.total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </BlurContainer>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  blurOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    flexDirection: "column",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: (width - 40) / 7,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
  dayTextPast: {
    color: colors.textSecondary,
  },
  timeSlotContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timeSlotTitleDisabled: {
    opacity: 0.4,
  },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginHorizontal: -5,
  },
  timeSlotButton: {
    width: (width - 60) / 3,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.4,
  },
  timeSlotButtonEnabled: {
    opacity: 0.7,
  },
  timeSlotButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    fontFamily: fonts.semiBold,
    opacity: 1,
  },
  timeSlotButtonDisabled: {
    opacity: 0.4,
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  timeSlotTextEnabled: {
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: fonts.semiBold,
  },
  timeSlotTextDisabled: {
    color: colors.textSecondary,
    opacity: 0.6,
  },
  guestsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  guestsTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  guestsTitleDisabled: {
    opacity: 0.4,
  },
  guestsInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestsInputContainerDisabled: {
    opacity: 0.4,
  },
  guestsIcon: {
    marginRight: 12,
  },
  guestsInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  guestsInputDisabled: {
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  breakdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  breakdownToggleText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  breakdownModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownBlurOverlay: {
    flex: 1,
    width: "100%",
  },
  breakdownModalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  breakdownModalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  breakdownModalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: colors.text,
  },
  breakdownCloseButton: {
    padding: 4,
  },
  breakdownDetails: {
    paddingTop: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  breakdownTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
  payButtonAmount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
});

export default BookingModal;
