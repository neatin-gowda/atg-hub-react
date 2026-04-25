export function getInitials(name) {
  return name ? name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() : '??';
}

export default function Avatar({ name, size = 'md', className = '', style = {}, onClick }) {
  return (
    <div className={`av av-${size} ${className}`} style={style} onClick={onClick}>
      {getInitials(name)}
    </div>
  );
}
