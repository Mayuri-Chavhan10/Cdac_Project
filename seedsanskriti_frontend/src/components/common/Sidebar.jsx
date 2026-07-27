import { NavLink } from 'react-router-dom';

export default function Sidebar({ groups }) {
  return (
    <aside className="app-sidebar p-3 rounded-3">
      {groups.map((group) => (
        <div key={group.heading} className="mb-3">
          {group.heading && <div className="sidebar-heading mb-2">{group.heading}</div>}
          <ul className="nav nav-pills flex-column">
            {group.items.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon}`} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
