import classnames from 'classnames';

interface Props {
  duration: number;
  healthyDelay?: number;
}

export const ResponseDuration = (props: Props) => {
  const delayMessage =
    props.duration < 1 ? '< 1 secs' : `${Math.round(props.duration)} secs`;
  const healthyDelay = props.healthyDelay || 3;
  return (
    <p
      className={classnames({
        'text-xs': true,
        ' text-red-500': props.duration > healthyDelay,
        ' text-green-500': props.duration <= healthyDelay,
      })}
    >
      Response in {delayMessage}
    </p>
  );
};
