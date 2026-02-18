type CoverProps = {
  backgroundImage: string;
  title: string;
  subtitle: string;
  breadcrumbs?: React.ReactNode;
};

const CoverSection = ({
  backgroundImage,
  title,
  subtitle,
  breadcrumbs = null,
}: CoverProps) => (
  <div
    className="blog-cover flex items-center justify-center relative"
    style={{
      backgroundImage: `linear-gradient(rgba(43, 35, 41, 0.8), rgba(28, 79, 156, 0.8)), url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "45vh",
      overflow: "hidden",
    }}
  >
    <div className="mx-auto text-center relative z-10 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-extrabold text-light sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto max-w-3xl mt-6 text-lg text-light">{subtitle}</p>
      </div>
      <div className="flex justify-center mt-5">{breadcrumbs}</div>
    </div>
  </div>
);

export default CoverSection;
