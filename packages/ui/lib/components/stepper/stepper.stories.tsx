import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../button/button";
import { Icon, type IconType } from "../icon/icon";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  SubStepper,
} from "./stepper";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveStepper = ({
  orientation,
  disableConnector = false,
}: {
  orientation: "horizontal" | "vertical";
  disableConnector?: boolean;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const steps: { title: string; description: string; icon: IconType }[] = [
    {
      title: "Account Details",
      description: "Enter your account information",
      icon: "person",
    },
    {
      title: "Business Info",
      description: "Tell us about your business",
      icon: "store",
    },
    {
      title: "Verification",
      description: "Verify your identity",
      icon: "verified_user",
    },
    {
      title: "Review",
      description: "Review and submit",
      icon: "check_circle",
    },
  ];

  const maxSteps = steps.length;

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, maxSteps));
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full max-w-3xl space-y-8 p-6 border rounded-lg min-w-[600px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">
          {orientation} Stepper {disableConnector ? "(No Connector)" : ""}
        </h3>
        <div className="text-sm font-medium">
          Step {Math.min(activeStep + 1, maxSteps)} of {maxSteps}
        </div>
      </div>

      <Stepper
        activeStep={activeStep}
        orientation={orientation}
        disableConnector={disableConnector}
      >
        {steps.map((step, index) => (
          <StepperItem key={index}>
            <StepperIndicator
              icon={<Icon type={step.icon} className="h-4 w-4" />}
            />
            <div className="flex flex-col">
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </div>
            {orientation === "vertical" && (
              <StepperContent>
                <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-md bg-muted/50 text-muted-foreground text-sm">
                  Content for {step.title}
                </div>
              </StepperContent>
            )}
          </StepperItem>
        ))}
      </Stepper>

      {orientation === "horizontal" && (
        <div className="mt-8 p-8 border-2 border-dashed rounded-lg flex items-center justify-center min-h-[200px] bg-muted/20">
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-2">
              {activeStep < maxSteps ? steps[activeStep].title : "Completed!"}
            </h4>
            <p className="text-muted-foreground">
              {activeStep < maxSteps
                ? `Step ${activeStep + 1} content goes here.`
                : "All steps finished."}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={activeStep === maxSteps}>
          {activeStep === maxSteps - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export const Horizontal: Story = {
  render: () => <InteractiveStepper orientation="horizontal" />,
};

export const Vertical: Story = {
  render: () => <InteractiveStepper orientation="vertical" />,
};

export const WithoutConnector: Story = {
  render: () => (
    <InteractiveStepper orientation="horizontal" disableConnector={true} />
  ),
};

export const VerticalWithoutConnector: Story = {
  render: () => (
    <InteractiveStepper orientation="vertical" disableConnector={true} />
  ),
};

const ComplexVerticalStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);

  let mainActiveStep = 0;
  let subActiveStep = 0;

  if (currentStep === 0) {
    mainActiveStep = 0;
  } else if (currentStep === 1) {
    mainActiveStep = 1;
    subActiveStep = 0;
  } else if (currentStep === 2) {
    mainActiveStep = 1;
    subActiveStep = 1;
  } else if (currentStep >= 3) {
    mainActiveStep = currentStep - 1;
    subActiveStep = 2; // Finished sub steps
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="w-[600px] border p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-6">
        Complex Vertical with Sub-steps
      </h3>
      <Stepper orientation="vertical" activeStep={mainActiveStep}>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>General Information</StepperTitle>
          <StepperDescription>Basic details about the role</StepperDescription>
          <StepperContent>
            <div className="h-10 bg-slate-50 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
              Form Content
            </div>
          </StepperContent>
        </StepperItem>

        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Location & Time</StepperTitle>
          <StepperDescription>Where and when</StepperDescription>
          <StepperContent>
            <SubStepper activeStep={subActiveStep}>
              <StepperItem>
                <StepperIndicator />
                <StepperTitle>Location</StepperTitle>
              </StepperItem>
              <StepperItem>
                <StepperIndicator />
                <StepperTitle>Schedule</StepperTitle>
              </StepperItem>
            </SubStepper>
          </StepperContent>
        </StepperItem>

        <StepperItem>
          <StepperIndicator icon={<Icon type="search" className="h-4 w-4" />} />
          <StepperTitle>Qualifications</StepperTitle>
          <StepperContent>
            <div className="h-10 bg-slate-50 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
              Form Content
            </div>
          </StepperContent>
        </StepperItem>

        <StepperItem>
          <StepperIndicator icon={<Icon type="money" className="h-4 w-4" />} />
          <StepperTitle>Salary & Benefits</StepperTitle>
          <StepperContent>
            <div className="h-10 bg-slate-50 border border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
              Form Content
            </div>
          </StepperContent>
        </StepperItem>

        <StepperItem>
          <StepperIndicator icon={<Icon type="person" className="h-4 w-4" />} />
          <StepperTitle>Onboarding</StepperTitle>
        </StepperItem>

        <StepperItem>
          <StepperIndicator icon={<Icon type="list" className="h-4 w-4" />} />
          <StepperTitle>Other Conditions</StepperTitle>
        </StepperItem>
      </Stepper>

      <div className="flex gap-4 mt-8 bg-background pt-4 border-t sticky bottom-0">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="secondary"
        >
          Previous
        </Button>
        <Button onClick={nextStep} disabled={currentStep === 7}>
          {currentStep === 6 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export const ComplexWithSubSteps: Story = {
  render: () => <ComplexVerticalStepper />,
};
