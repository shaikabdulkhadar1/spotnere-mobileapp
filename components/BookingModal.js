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
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";

const { width, height } = Dimensions.get("window");

const BookingModal = ({ visible, onClose, placeDetails }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [guests, setGuests] = useState("");

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

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!selectedDate || !selectedTimeSlot || !guests) &&
                    styles.payButtonDisabled,
                ]}
                onPress={() => {
                  if (selectedDate && selectedTimeSlot && guests) {
                    // TODO: Implement payment and booking logic
                    console.log("Pay and Book pressed", {
                      date: selectedDate,
                      timeSlot: selectedTimeSlot,
                      guests: guests,
                    });
                  }
                }}
                disabled={!selectedDate || !selectedTimeSlot || !guests}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.payButtonText,
                    (!selectedDate || !selectedTimeSlot || !guests) &&
                      styles.payButtonTextDisabled,
                  ]}
                >
                  Pay and Book
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurContainer>
      </View>
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
    opacity: 1,
  },
  timeSlotButtonDisabled: {
    opacity: 0.4,
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
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
    fontFamily: fonts.regular,
    color: colors.text,
  },
  guestsInputDisabled: {
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.bold,
  },
  payButtonTextDisabled: {
    color: colors.textSecondary,
  },
});

export default BookingModal;
