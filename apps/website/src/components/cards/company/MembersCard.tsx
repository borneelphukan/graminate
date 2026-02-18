import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface MembersCardProps {
  avatar: string;
  name: string;
  role: string;
  description: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

const MembersCard: React.FC<MembersCardProps> = ({
  avatar,
  name,
  role,
  description,
  linkedin,
  github,
  website,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl transition hover:shadow-2xl">
      <div className="flex flex-col items-center p-6">
        <div className="relative h-32 w-32 rounded-full overflow-hidden shadow-md">
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width={128}
            height={128}
            className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
          />
        </div>

        <div className="text-center mt-4">
          <h3 className="text-lg font-semibold text-dark dark:text-light">
            {name}
          </h3>
          <p className="text-sm text-dark dark:text-light mb-2">{role}</p>
          <p className="text-sm text-dark dark:text-light">{description}</p>
        </div>

        <div className="mt-4 flex space-x-4">
          {linkedin && (
            <a
              href={linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
            </a>
          )}
          {github && (
            <a
              href={github}
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black"
            >
              <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
            </a>
          )}
          {website && (
            <a
              href={website}
              aria-label="Website"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500"
            >
              <FontAwesomeIcon icon={faGlobe} className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersCard;
