//
// ExpireLRUCache.h
//
// Library: Foundation
// Package: Cache
// Module:  ExpireLRUCache
//
// Definition of the ExpireLRUCache class.
//
// Copyright (c) 2006, Applied Informatics Software Engineering GmbH.
// and Contributors.
//
// SPDX-License-Identifier:	BSL-1.0
//


#ifndef Foundation_ExpireLRUCache_INCLUDED
#define Foundation_ExpireLRUCache_INCLUDED


#include "./AbstractCache.h"
#include "./StrategyCollection.h"
#include "./ExpireStrategy.h"
#include "./LRUStrategy.h"


namespace Poco {


template <
	class TKey,
	class TValue,
	class TMutex = FastMutex,
	class TEventMutex = FastMutex
>
class ExpireLRUCache: public AbstractCache<TKey, TValue, StrategyCollection<TKey, TValue>, TMutex, TEventMutex>
	/// An ExpireLRUCache combines LRU caching and time based expire caching.
	/// It cache entries for a fixed time period (per default 10 minutes)
	/// but also limits the size of the cache (per default: 1024).
{
public:
	ExpireLRUCache(std::size_t cacheSize = 1024, Timestamp::TimeDiff expire = 600000):
		AbstractCache<TKey, TValue, StrategyCollection<TKey, TValue>, TMutex, TEventMutex>(StrategyCollection<TKey, TValue>())
	{
		this->_strategy.pushBack(new LRUStrategy<TKey, TValue>(cacheSize));
		this->_strategy.pushBack(new ExpireStrategy<TKey, TValue>(expire));
	}

	~ExpireLRUCache()
	{
	}

private:
	ExpireLRUCache(const ExpireLRUCache& aCache);
	ExpireLRUCache& operator = (const ExpireLRUCache& aCache);
};


} // namespace Poco


#endif // Foundation_ExpireLRUCache_INCLUDED
