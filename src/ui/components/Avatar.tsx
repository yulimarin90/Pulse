// Circle with the first letter of the name; the color is derived from the name.
export default function Avatar({ name }: { name: string }) {
  const hue = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  return (
    <span className="avatar" style={{ background: `hsl(${hue} 45% 35%)` }} aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}