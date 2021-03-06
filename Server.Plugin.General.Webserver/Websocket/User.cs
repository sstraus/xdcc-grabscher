//
//  User.cs
//
//  Author:
//       Lars Formella <ich@larsformella.de>
//
//  Copyright (c) 2012 Lars Formella
//
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 2 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program; if not, write to the Free Software
//  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
//

using Fleck;

using System;
using System.Collections.Generic;

using XG.Core;

namespace XG.Server.Plugin.General.Webserver.Websocket
{
	public class User
	{
		#region VARIABLES

		public IWebSocketConnection Connection { get; set; }

		public bool IgnoreOfflineBots { get; set; }

		public Guid LastViewedServer { get; set; }

		public List<Channel> LastLoadedChannels { get; set; }
		
		public Guid LastSearch { get; set; }

		public List<Bot> LastLoadedBots { get; set; }
		
		public Guid LastViewedBot { get; set; }

		public List<Packet> LastLoadedPackets { get; set; }

		#endregion
	}
}

