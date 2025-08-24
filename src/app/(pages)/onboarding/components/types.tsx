export type StepValue = string | string[];

export type StepProps = {
  value?: StepValue;
  onChange: (val: StepValue) => void;
};
