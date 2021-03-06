// 
//  Filesystem.cs
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

using System.IO;

using NUnit.Framework;

using XG.Server.Helper;

namespace XG.Server.Test.Helper
{
	[TestFixture]
	public class Filesystem
	{
		[Test]
		public void MoveFile()
		{
			const string fileNameOld = "test1.txt";
			const string fileNameNew = "test2.txt";

			File.Delete(fileNameOld);
			File.Delete(fileNameNew);

			bool result = FileSystem.MoveFile(fileNameOld, fileNameNew);
			Assert.AreEqual(false, result);

			File.Create(fileNameOld).Close();

			result = FileSystem.MoveFile(fileNameOld, fileNameNew);
			Assert.AreEqual(true, result);
			Assert.AreEqual(false, File.Exists(fileNameOld));
			Assert.AreEqual(true, File.Exists(fileNameNew));

			File.Delete(fileNameNew);
		}
	}
}
