/**
 * Copyright (c) 2018 Kaj Magnus Lindberg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.debiki.dao.rdb

import com.debiki.core._
import com.debiki.core.Prelude._
import java.{sql => js}
import Rdb._


/** Loads and saves PageNotfPref:s.
  *
  * Tested here:  TyT8MKRD25
  */
trait PageNotfPrefsSiteTxMixin extends SiteTransaction {
  self: RdbSiteTransaction =>


  private def conflictColumnNameValue(notfPref: PageNotfPref): (String, AnyRef) =
    if (notfPref.pageId.isDefined)
      "page_id" -> notfPref.pageId.get.asAnyRef
    else if (notfPref.pagesInCategoryId.isDefined)
      "pages_in_category_id" -> notfPref.pagesInCategoryId.get.asAnyRef
    else if (notfPref.wholeSite)
      "pages_in_whole_site" -> true.asAnyRef
    else
      die("TyE2ABK057")


  override def upsertPageNotfPref(notfPref: PageNotfPref) {
    val (conflictColumnName, _) = conflictColumnNameValue(notfPref)

    val insertStatement = s"""
      insert into page_notf_prefs3 (
        site_id,
        people_id,
        notf_level,
        page_id,
        pages_in_whole_site,
        pages_in_category_id)
        -- pages_with_tag_label_id,
      values (?, ?, ?, ?, ?, ?)
      -- There can be only one on-conflict clause.
      on conflict (site_id, people_id, $conflictColumnName)
      do update set
        notf_level = excluded.notf_level
      """

    val values = List(
      siteId.asAnyRef,
      notfPref.peopleId.asAnyRef,
      notfPref.notfLevel.toInt.asAnyRef,
      notfPref.pageId.orNullVarchar,
      // pages_in_whole_site needs to be null, if isn't true, because of a unique constraint.
      if (notfPref.wholeSite) true.asAnyRef else NullBoolean,
      notfPref.pagesInCategoryId.orNullInt)

    runUpdateSingleRow(insertStatement, values)
  }


  override def deletePageNotfPref(notfPref: PageNotfPref): Boolean = {
    untested("TyE7BAKRSW02", "Deleting notf prefs")
    val (conflictColumnName, conflictColumnValue) = conflictColumnNameValue(notfPref)
    val deleteStatement = s"""
      delete from page_notf_prefs3
      where site_id = ?
        and people_id = ?
        and $conflictColumnName = ?
      """
    runUpdateSingleRow(deleteStatement, List(
        siteId.asAnyRef, notfPref.peopleId.asAnyRef, conflictColumnValue))
  }


  def loadEffectiveNotfLevels(peopleId: UserId, pageId: PageId, categoryId: Option[CategoryId])
        : PageNotfLevels = {
    def selectNotfLevelWhere(what: Int) = s"""
      select notf_level, $what as what
      from page_notf_prefs3
      where site_id = ?
        and people_id = ?"""

    val query = s"""
      ${selectNotfLevelWhere(111)} and page_id = ?
      union
      ${selectNotfLevelWhere(222)} and pages_in_category_id = ?
      union
      ${selectNotfLevelWhere(333)} and pages_in_whole_site
      """

    val values = List(
        siteId.asAnyRef, peopleId.asAnyRef, pageId,
        siteId.asAnyRef, peopleId.asAnyRef, categoryId.getOrElse(NoCategoryId).asAnyRef,
        siteId.asAnyRef, peopleId.asAnyRef)

    var result = PageNotfLevels(None, None, None)

    runQueryFindMany(query, values, rs => {
      val notfLevelInt = getInt(rs, "notf_level")
      val notfLevel = NotfLevel.fromInt(notfLevelInt).getOrElse(NotfLevel.Normal)
      val what = getInt(rs, "what")
      what match {
        case 111 => result = result.copy(forPage = Some(notfLevel))
        case 222 => result = result.copy(forCategory = Some(notfLevel))
        case 333 => result = result.copy(forWholeSite = Some(notfLevel))
        case _ => die("TyE7KTW42")
      }
    })

    result
  }


  def loadPeopleIdsWatchingPage(pageId: PageId, minNotfLevel: NotfLevel): Set[UserId] = {
    loadPeopleIdsImpl("page_id", pageId, minNotfLevel)
  }

  def loadPeopleIdsWatchingCategory(categoryId: CategoryId, minNotfLevel: NotfLevel): Set[UserId] = {
    loadPeopleIdsImpl("pages_in_category_id", categoryId.asAnyRef, minNotfLevel)
  }

  def loadPeopleIdsWatchingWholeSite(minNotfLevel: NotfLevel): Set[UserId] = {
    loadPeopleIdsImpl("pages_in_whole_site", true.asAnyRef, minNotfLevel)
  }


  def loadPeopleIdsImpl(conflictColumnName: String, conflictColumnValue: AnyRef, minNotfLevel: NotfLevel)
        : Set[UserId] = {
    val query = s"""
      select people_id from page_notf_prefs3
      where site_id = ?
        and $conflictColumnName = ?
        and notf_level >= ?
      """

    val values = List(
      siteId.asAnyRef,
      conflictColumnValue,
      minNotfLevel.toInt.asAnyRef)

    runQueryFindMany(query, values, rs => {
      rs.getInt("people_id")
    }).toSet
  }


  private def readNotfPref(rs: js.ResultSet): PageNotfPref = {
    PageNotfPref(
      peopleId = getInt(rs, "people_id"),
      pageId = getOptString(rs, "page_id"),
      pagesInCategoryId = getOptInt(rs, ""),
      notfLevel = NotfLevel.fromInt(getInt(rs, "")).getOrElse(NotfLevel.Normal))
  }

}
