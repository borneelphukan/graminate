import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

type ContentSectionProps = {
  imageSrc: string;
  alt: string;
  title: string;
  paragraphs: string[];
  listItems: string[];
  reverse?: boolean;
  titleClass?: string;
  paragraphClass?: string;
  listClass?: string;
};

const ContentSection = ({
  imageSrc,
  alt,
  title,
  paragraphs,
  listItems,
  reverse = false,
  titleClass = "text-3xl font-bold mb-4",
  paragraphClass = "text-lg",
  listClass = "list-disc list-inside mt-4 space-y-2",
}: ContentSectionProps) => (
  <section
    className={`animate-fadeIn flex flex-col ${
      reverse ? "md:flex-row-reverse" : "md:flex-row"
    } items-center gap-8`}
  >
    <div className="md:w-1/2">
      <Image
        src={imageSrc}
        alt={alt}
        className="rounded-xl shadow-lg w-full"
        width={1200}
        height={500}
      />
    </div>
    <div className="md:w-1/2">
      <h2 className={titleClass}>{title}</h2>
      {paragraphs.map((text, index) => (
        <p
          key={index}
          className={`${paragraphClass} ${index > 0 ? "mt-2" : ""}`}
        >
          {text}
        </p>
      ))}
      <ul className={listClass}>
        {listItems.map((item, index) => (
          <li key={index} className="flex gap-x-3">
            <FontAwesomeIcon icon={faCircleCheck} className="text-green-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ContentSection;
