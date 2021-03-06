//
//  websocket.js
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

var XGWebsocket = Class.create(
{
	/**
	 * @param {XGCookie} cookie
	 * @param {String} url
	 * @param {String} port
	 * @param {String} password
	 * @param {XGStatistics} statistics
	 */
	initialize: function(cookie, url, port, password, statistics)
	{
		this.cookie = cookie;
		this.url = url;
		this.port = port;
		this.password = password;
		this.statistics = statistics;

		this.connect();
	},

	connect: function ()
	{
		var self = this;

		this.state = WebSocket.CLOSED;
		try
		{
			this.socket = new WebSocket("ws://" + this.url + ":" + this.port);
			this.socket.onopen = function ()
			{
				self.state = self.socket.readyState;

				self.onConnected();
			};
			this.socket.onmessage = function (msg)
			{
				self.onMessageReceived(JSON.parse(msg.data));
			};
			this.socket.onclose = function ()
			{
				self.state = self.socket.readyState;

				self.onDisconnected();
			};
			this.socket.onerror = function ()
			{
				self.state = self.socket.readyState;

				self.onError("");
			};
		}
		catch (exception)
		{
			if (self.socket != undefined)
			{
				self.state = self.socket.readyState;
			}

			self.onError(exception);
		}
	},

	/**
	 * @param {Enum.Request} Type
	 * @return {Object}
	 */
	buildRequest: function(Type)
	{
		return {
			"Password": this.password,
			"Type": Type,
			"IgnoreOfflineBots": this.cookie.getCookie("show_offline_bots", false) == "1"
		};
	},

	/**
	 * @param {Enum.Request} type
	 * @return {Boolean}
	 */
	send: function(type)
	{
		var request = this.buildRequest(type);

		return this.sendRequest(request);
	},

	/**
	 * @param {Enum.Request} type
	 * @param {String} name
	 * @return {Boolean}
	 */
	sendName: function(type, name)
	{
		var request = this.buildRequest(type);
		request.Name = name;

		return this.sendRequest(request);
	},

	/**
	 * @param {Enum.Request} type
	 * @param {String} guid
	 * @return {Boolean}
	 */
	sendGuid: function(type, guid)
	{
		var request = this.buildRequest(type);
		request.Guid = guid;

		return this.sendRequest(request);
	},

	/**
	 * @param {Enum.Request} type
	 * @param {String} name
	 * @param {String} guid
	 * @return {Boolean}
	 */
	sendNameGuid: function(type, name, guid)
	{
		var request = this.buildRequest(type);
		request.Name = name;
		request.Guid = guid;

		return this.sendRequest(request);
	},

	/**
	 * @param {Object} request
	 * @return {Boolean}
	 */
	sendRequest: function(request)
	{
		if (this.state == WebSocket.OPEN)
		{
			switch (request.Type)
			{
				case Enum.Request.Search:
					$("#bots_loading .loading-symbol").show();
					$("#packets_loading .loading-symbol").show();
					break;
				case Enum.Request.SearchExternal:
					$("#packets_external_loading .loading-symbol").show();
					break;

				case Enum.Request.Servers:
					$("#servers_loading .loading-symbol").show();
					break;
				case Enum.Request.ChannelsFromServer:
					$("#channels_loading .loading-symbol").show();
					break;
				case Enum.Request.PacketsFromBot:
					$("#packets_loading .loading-symbol").show();
					break;
				case Enum.Request.Files:
					$("#files_loading .loading-symbol").show();
					break;
			}

			try
			{
				this.socket.send(JSON.stringify(request));
				return true;
			}
			catch (exception)
			{
			}
		}

		return false;
	},

	/**
	 * @param {String} grid
	 * @param {String} guid
	 * @return {object}
	 */
	getRowData: function (grid, guid)
	{
		var str = $("#" + grid).getRowData(guid).Object;
		return JSON.parse(JSON.parse(str).Object);
	},

	onConnected: function ()
	{
		this.send(Enum.Request.Searches);
		this.send(Enum.Request.Servers);
		this.send(Enum.Request.Files);
		this.send(Enum.Request.Snapshots);
	},

	onDisconnected: function ()
	{
		$("#dialog_error").dialog("open");
	},

	onMessageReceived: function (json)
	{
		if (json.DataType == "String")
		{
			json.DataType = json.Data;
		}
	
		var grid = "";
		switch (json.DataType)
		{
			case "Server":
				grid = "servers";
				break;
			case "Channel":
				grid = "channels";
				break;
			case "Bot":
				grid = "bots";
				break;
			case "Packet":
				grid = "packets";
				break;
			case "Object":
				grid = "search";
				break;
			case "Snapshot":
				break;
			case "File":
				grid = "files";
				break;
		}

		switch (json.Type)
		{
			case Enum.Response.ObjectAdded:
				if (grid != "")
				{
					this.addGridItem(grid, json.Data);
					if (grid == "search")
					{
						$("#search-text").effect("transfer", { to: $("#" + json.Data.Guid) }, 500);
					}
				}
				break;
			case Enum.Response.ObjectRemoved:
				if (grid != "")
				{
					if (grid == "search")
					{
						$("#" + json.Data.Guid).effect("transfer", { to: $("#search-text") }, 500);
					}
					this.removeGridItem(grid, json.Data);
				}
				break;
			case Enum.Response.ObjectChanged:
				if (grid != "")
				{
					this.updateGridItem(grid, json.Data);
				}
				break;

			case Enum.Response.BlockStart:
				var gridElement = $("#" + grid + "_table");
				gridElement.clearGridData();
				break;

			case Enum.Response.BlockStop:
				$("#" + grid + "_loading .loading-symbol").hide();
				break;
/*
			case Enum.Response.SearchPacket:
				this.setGridData("packets", json.Data);
				break;
			case Enum.Response.SearchBot:
				this.setGridData("bots", json.Data);
				break;
*/
			case Enum.Response.SearchExternal:
				this.setGridData("packets_external", json.Data);
				break;
/*
			case Enum.Response.Servers:
				this.setGridData("servers", json.Data);
				break;
			case Enum.Response.ChannelsFromServer:
				this.setGridData("channels", json.Data);
				break;
			case Enum.Response.PacketsFromBot:
				this.setGridData("packets", json.Data);
				break;

			case Enum.Response.Files:
				this.setGridData("files", json.Data);
				break;
*/
			case Enum.Response.Searches:
				this.setGridData("search", json.Data);
				break;

			case Enum.Response.Snapshots:
				this.statistics.setSnapshots(json.Data);
				break;
			case Enum.Response.Statistics:
				this.statistics.setStatistics(json.Data);
				break;
		}
	},

	/**
	 * @param {String} grid
	 * @param {Array} data
	 */
	setGridData: function (grid, data)
	{
		var self = this;

		$("#" + grid + "_loading .loading-symbol").hide();
		var gridElement = $("#" + grid + "_table");
		gridElement.clearGridData();
		$.each(data, function(i, item)
		{
			item = self.adjustObjectForJQGrid(item);
			gridElement.addRowData(item.Guid, item);
		});
		gridElement.trigger("reloadGrid");
	},

	/**
	 * @param {String} grid
	 * @param {Object} item
	 */
	addGridItem: function (grid, item)
	{
		var gridElement = $("#" + grid + "_table");
		item = this.adjustObjectForJQGrid(item);
		gridElement.addRowData(item.Guid, item);
	},

	/**
	 * @param {String} grid
	 * @param {Object} item
	 */
	updateGridItem: function (grid, item)
	{
		var gridElement = $("#" + grid + "_table");
		item = this.adjustObjectForJQGrid(item);
		gridElement.jqGrid("setRowData", item.Guid, item);
	},

	/**
	 * @param {String} grid
	 * @param {Object} item
	 */
	removeGridItem: function (grid, item)
	{
		var gridElement = $("#" + grid + "_table");
		gridElement.delRowData(item.Guid);
	},

	/**
	 * @param {Object} item
	 * @return {Object}
	 */
	adjustObjectForJQGrid: function (item)
	{
		item.Object = JSON.stringify(item);
		item.Icon = "";
		if (item.Speed == undefined)
		{
			item.Speed = 0;
		}
		if (item.TimeMissing == undefined)
		{
			item.TimeMissing = 0;
		}
		if (item.InfoSpeed == undefined)
		{
			item.InfoSpeed = 0;
		}
		if (item.InfoSlot == undefined)
		{
			item.InfoSlot = 0;
		}
		if (item.InfoQueue == undefined)
		{
			item.InfoQueue = 0;
		}
		return item;
	}
});
