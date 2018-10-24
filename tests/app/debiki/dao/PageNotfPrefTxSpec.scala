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

package debiki.dao

import com.debiki.core._
import com.debiki.core.Prelude._
import org.scalatest._


class PageNotfPrefTxSpec extends DaoAppSuite(disableScripts = true, disableBackgroundJobs = true) {
  var dao: SiteDao = _
  var owner: User = _
  var userOne: User = _
  var userTwo: User = _

  var forumPageId: PageId = _
  var categoryId: CategoryId = _

  var pageId: PageId = _

  lazy val now: When = globals.now()


  "PageNotPref SiteTransaction fns can" - {

    "prepare" in {
      globals.systemDao.getOrCreateFirstSite()
      dao = globals.siteDao(Site.FirstSiteId)
      owner = createPasswordOwner("5kwu8f40", dao)
      userOne = createPasswordUser("pp22xxnn", dao, trustLevel = TrustLevel.BasicMember)
      userTwo = createPasswordUser("jjyyzz55", dao, trustLevel = TrustLevel.BasicMember)

      pageId = createPage(PageRole.Discussion, dao.textAndHtmlMaker.forTitle("Notfs Test Page"),
        bodyTextAndHtml = dao.textAndHtmlMaker.forBodyOrComment("Text text."),
        authorId = SystemUserId, browserIdData, dao,
      // ???
        anyCategoryId = None)

      val createForumResult =
          dao.createForum("Forum", s"/drafts-forum/", isForEmbCmts = false,
            Who(owner.id, browserIdData))

      categoryId = createForumResult.defaultCategoryId
      forumPageId = createForumResult.pagePath.pageId.get
    }

    "find no people watching" in {
      dao.readOnlyTransaction { tx =>
        tx.loadPeopleIdsWatchingPage(pageId, minNotfLevel = NotfLevel.Muted) mustBe Set.empty
        tx.loadPeopleIdsWatchingCategory(categoryId, minNotfLevel = NotfLevel.Muted) mustBe Set.empty
        tx.loadPeopleIdsWatchingWholeSite(minNotfLevel = NotfLevel.Muted) mustBe Set.empty
      }
    }

    //  member watches page
    //  member watches category
    //  member watches whole site

    //  group watches page
    //  group watches category
    //  group watches whole site

    //  group watches page,           member has muted
    //  group watches category,       member has muted
    //  group watches whole site,     member has muted

    //  group has muted page,      member watches all posts
    //  group has muted category,  member watches page, all posts
    //  group has muted category,  member watches category, new topics

    //  group watches new-topics category,    member watches all, page
    //  group watches new-topics category,    member watches all, category
    //  group watches new-topics category,    member watches all, whole site

    //  group watches new-topics whole-site,    member watches all, page
    //  group watches new-topics whole-site,    member watches all, category
    //  group watches new-topics whole-site,    member watches all, whole site

  }

}
