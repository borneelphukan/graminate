import { Icon } from "@graminate/ui";

type CalendarHeaderProps = {
  calendarMonth: number;
  calendarYear: number;
  previousMonth: () => void;
  nextMonth: () => void;
};

const CalendarHeader = ({
  calendarMonth,
  calendarYear,
  previousMonth,
  nextMonth,
}: CalendarHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <button
      className="flex w-9 h-9 items-center justify-center rounded-full text-dark dark:text-light hover:bg-gray-400 dark:hover:text-light dark:hover:bg-gray-200 transition-colors duration-300 ease-in-out"
      onClick={previousMonth}
      aria-label="Previous month"
    >
      <Icon type={"chevron_left"} size="lg" />
    </button>
    <div className="flex items-center">
      <h2 className="text-lg font-semibold text-dark dark:text-light tracking-wide">
        {`${new Date(calendarYear, calendarMonth).toLocaleString("default", {
          month: "long",
        })} ${calendarYear}`}
      </h2>
    </div>
    <button
      className="flex w-9 h-9 items-center justify-center rounded-full text-dark dark:text-light hover:bg-gray-400 dark:hover:text-light dark:hover:bg-gray-200 transition-colors duration-300 ease-in-out"
      onClick={nextMonth}
      aria-label="Next month"
    >
      <Icon type={"chevron_right"} size="lg" />
    </button>
  </div>
);
export default CalendarHeader;
