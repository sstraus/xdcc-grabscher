// 
//  Channel.cs
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

using Newtonsoft.Json;

using System;
using System.Collections.Generic;
using System.Linq;

namespace XG.Core
{
	[Serializable]
	[JsonObject(MemberSerialization.OptIn)]
	public class Channel : AObjects
	{
		#region VARIABLES

		[JsonProperty]
		[MySql]
		public override bool Connected
		{
			get { return base.Connected; }
			set
			{
				if (!value)
				{
					foreach (AObject obj in All)
					{
						obj.Connected = false;
					}
				}
				base.Connected = value;
			}
		}

		public new Server Parent
		{
			get { return base.Parent as Server; }
			set { base.Parent = value; }
		}

		int _errorCode;

		[JsonProperty]
		[MySql]
		public int ErrorCode
		{
			get { return _errorCode; }
			set { SetProperty(ref _errorCode, value); }
		}

		#endregion

		#region CHILDREN

		public IEnumerable<Bot> Bots
		{
			get { return All.Cast<Bot>(); }
		}

		public Bot Bot(string aName)
		{
			return base.Named(aName) as Bot;
		}

		public void AddBot(Bot aBot)
		{
			Add(aBot);
		}

		public void RemoveBot(Bot aBot)
		{
			Remove(aBot);
		}

		#endregion
	}
}
